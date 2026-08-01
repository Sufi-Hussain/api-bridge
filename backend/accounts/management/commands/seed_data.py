"""
seed_data — realistic, idempotent demo data for local/staging environments.

Creates:
  * 2 organizations (tenants) with settings
  * the system role/permission catalogue (via core.seeds.roles)
  * 100 employees split across the two orgs, each with a login, an
    OrganizationMember row, a role assignment, employment, address, bank,
    emergency contact, education, experience and skills
  * departments, leave types, holidays, leave requests, attendance punches,
    timesheets and payslips so every ESS/HR page has data to render

Usage:
    python manage.py seed_data                # 100 employees, keeps existing data
    python manage.py seed_data --employees 40
    python manage.py seed_data --flush        # delete previously seeded tenants first

Deterministic: a fixed RNG seed means repeated runs produce the same people.
Demo password for every seeded account: Passw0rd!123
"""
from __future__ import annotations

import random
from datetime import date, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Organization, OrganizationMember, Role, UserRole, User
from apps.attendance.models import AttendancePunch, TimesheetEntry
from apps.ess.models import (
    Address,
    BankAccount,
    Education,
    EmergencyContact,
    Employee,
    EmployeeSkill,
    Employment,
    Experience,
    Skill,
)
from apps.hr.models import Department
from apps.leave.models import Holiday, LeaveRequest, LeaveType
from apps.payroll.models import Payslip, PayslipLine
from core.seeds.roles import seed_system_roles

DEMO_PASSWORD = "Ss1234567890"

ORGS = [
    {"name": "Acme Corporation", "slug": "acme", "domain": "acme.com", "share": 0.6},
    {"name": "Northwind Traders", "slug": "northwind", "domain": "northwind.com", "share": 0.4},
]

FIRST_NAMES = [
    "Aarav", "Diya", "Kabir", "Meera", "Rohan", "Ananya", "Vivaan", "Isha", "Arjun", "Priya",
    "Nikhil", "Sara", "Dev", "Tara", "Aditya", "Neha", "Karan", "Riya", "Manav", "Kavya",
    "Liam", "Emma", "Noah", "Olivia", "Ethan", "Ava", "Lucas", "Mia", "Henry", "Sofia",
]
LAST_NAMES = [
    "Sharma", "Iyer", "Patel", "Nair", "Kapoor", "Reddy", "Chopra", "Menon", "Verma", "Bose",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore",
]
DEPARTMENTS = [
    ("Engineering", ["Software Engineer", "Senior Software Engineer", "Engineering Manager", "QA Engineer"]),
    ("Design", ["Product Designer", "Senior Product Designer", "Design Lead"]),
    ("People", ["HR Business Partner", "Recruiter", "People Operations Lead"]),
    ("Finance", ["Financial Analyst", "Payroll Specialist", "Finance Manager"]),
    ("Sales", ["Account Executive", "Sales Manager", "Sales Development Rep"]),
    ("Customer Success", ["Support Engineer", "Customer Success Manager"]),
    ("Marketing", ["Content Strategist", "Growth Marketer"]),
]
LOCATIONS = ["Bengaluru", "Mumbai", "Pune", "London", "Berlin", "Austin", "Remote"]
COUNTRIES = {"Bengaluru": "India", "Mumbai": "India", "Pune": "India", "London": "United Kingdom",
             "Berlin": "Germany", "Austin": "United States", "Remote": "India"}
GRADES = ["L1", "L2", "L3", "L4", "L5", "M1", "M2"]
BANDS = ["Band A", "Band B", "Band C", "Band D"]
SKILLS = ["Python", "Django", "React", "TypeScript", "SQL", "Figma", "Communication",
          "Leadership", "Data Analysis", "Project Management"]
LEAVE_TYPES = [
    ("AL", "Annual Leave", 24),
    ("SL", "Sick Leave", 12),
    ("CL", "Casual Leave", 8),
    ("ML", "Maternity/Paternity Leave", 90),
    ("LOP", "Loss of Pay", 0),
]
HOLIDAYS = [
    ("New Year's Day", (1, 1)), ("Republic Day", (1, 26)), ("Holi", (3, 14)),
    ("Good Friday", (4, 18)), ("Labour Day", (5, 1)), ("Independence Day", (8, 15)),
    ("Diwali", (10, 20)), ("Christmas Day", (12, 25)),
]
PROJECTS = ["Atlas Platform", "Payments Revamp", "Mobile App", "Data Warehouse", "Internal Tools"]


class Command(BaseCommand):
    help = "Seed 2 organizations with realistic employees and HR/ESS data."

    def add_arguments(self, parser):
        parser.add_argument("--employees", type=int, default=100,
                            help="Total employees across both organizations (default 100).")
        parser.add_argument("--flush", action="store_true",
                            help="Delete the seeded organizations (and their data) first.")

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(20260101)
        total = max(2, options["employees"])

        if options["flush"]:
            self._flush()

        seed_system_roles()
        roles = {r.slug: r for r in Role.objects.filter(organization__isnull=True)}
        skills = {name: Skill.objects.get_or_create(name=name)[0] for name in SKILLS}
        leave_types = [
            LeaveType.objects.get_or_create(
                code=code, defaults={"name": name, "annual_quota": quota}
            )[0]
            for code, name, quota in LEAVE_TYPES
        ]
        self._seed_holidays()

        created_employees = 0
        for index, spec in enumerate(ORGS):
            org, _ = Organization.objects.get_or_create(
                slug=spec["slug"], defaults={"name": spec["name"], "is_active": True}
            )
            count = round(total * spec["share"]) if index == 0 else total - round(total * ORGS[0]["share"])
            departments = self._seed_departments(org)
            people = self._seed_people(org, spec, count, rng, roles, skills, departments)
            self._seed_managers(people, rng)
            for emp in people:
                self._seed_timeline(emp, rng, leave_types)
            created_employees += len(people)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Organization.objects.count()} organizations and "
            f"{created_employees} employees. Demo password: {DEMO_PASSWORD}"
        ))

    # ------------------------------------------------------------------ helpers

    def _flush(self):
        orgs = Organization.objects.filter(slug__in=[o["slug"] for o in ORGS])
        user_ids = list(
            OrganizationMember.objects.filter(organization__in=orgs).values_list("user_id", flat=True)
        )
        Employee.objects.filter(organization__in=orgs).delete()
        orgs.delete()
        User.objects.filter(id__in=user_ids, is_superuser=False).delete()
        self.stdout.write("Flushed previously seeded organizations.")

    def _seed_holidays(self):
        year = date.today().year
        for name, (month, day) in HOLIDAYS:
            Holiday.objects.get_or_create(name=name, date=date(year, month, day),
                                          defaults={"region": "All"})

    def _seed_departments(self, org) -> list[Department]:
        out = []
        for name, _titles in DEPARTMENTS:
            dept, _ = Department.objects.get_or_create(
                organization=org, name=name, defaults={"budget": Decimal("500000.00")}
            )
            out.append(dept)
        return out

    def _seed_people(self, org, spec, count, rng, roles, skills, departments):
        people: list[Employee] = []
        for i in range(count):
            first = rng.choice(FIRST_NAMES)
            last = rng.choice(LAST_NAMES)
            seq = i + 1
            email = f"{first.lower()}.{last.lower()}{seq}@{spec['domain']}"
            dept_name, titles = DEPARTMENTS[i % len(DEPARTMENTS)]
            title = rng.choice(titles)
            location = rng.choice(LOCATIONS)
            join = date.today() - timedelta(days=rng.randint(90, 2400))

            user, created = User.objects.get_or_create(
                email=email,
                defaults={"first_name": first, "last_name": last, "email_verified": True},
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save(update_fields=["password"])

            OrganizationMember.objects.get_or_create(
                organization=org, user=user, defaults={"status": "active", "is_primary": True}
            )
            slug = self._role_for(title, i)
            if slug in roles:
                UserRole.objects.get_or_create(user=user, role=roles[slug], organization=org)

            emp, _ = Employee.objects.get_or_create(
                user=user,
                defaults={
                    "organization": org,
                    "employee_id": f"{spec['slug'][:3].upper()}-{10000 + seq}",
                    "first_name": first,
                    "last_name": last,
                    "gender": rng.choice(["male", "female", "non-binary", "prefer-not-to-say"]),
                    "dob": date(rng.randint(1978, 2001), rng.randint(1, 12), rng.randint(1, 28)),
                    "marital_status": rng.choice(["single", "married"]),
                    "nationality": COUNTRIES[location],
                    "blood_group": rng.choice(["A+", "B+", "O+", "AB+"]),
                    "personal_email": f"{first.lower()}.{last.lower()}{seq}@example.com",
                    "work_email": email,
                    "mobile": f"+91{rng.randint(7000000000, 9999999999)}",
                },
            )
            if emp.organization_id != org.id:
                emp.organization = org
                emp.save(update_fields=["organization"])

            Employment.objects.get_or_create(
                employee=emp,
                defaults={
                    "job_title": title,
                    "department": dept_name,
                    "grade": rng.choice(GRADES),
                    "employment_type": rng.choices(
                        ["full-time", "part-time", "contract", "intern"], [85, 5, 7, 3]
                    )[0],
                    "location": location,
                    "work_mode": rng.choice(["on-site", "hybrid", "remote"]),
                    "join_date": join,
                    "cost_center": f"CC-{rng.randint(100, 999)}",
                    "business_unit": dept_name,
                    "team": f"{dept_name} Team {rng.randint(1, 3)}",
                    "band": rng.choice(BANDS),
                    "country": COUNTRIES[location],
                    "status": rng.choices(
                        ["active", "on_leave", "probation", "notice"], [88, 4, 6, 2]
                    )[0],
                    "salary_base": Decimal(rng.randrange(45000, 220000, 1000)),
                    "currency": "USD" if COUNTRIES[location] == "United States" else "INR",
                    "performance_rating": Decimal(str(rng.choice([2.5, 3.0, 3.5, 4.0, 4.5, 5.0]))),
                    "potential": rng.choice(["low", "medium", "high"]),
                },
            )
            Address.objects.get_or_create(
                employee=emp,
                defaults={
                    "line1": f"{rng.randint(1, 400)} {rng.choice(['Park', 'Hill', 'Lake', 'Garden'])} Street",
                    "city": location if location != "Remote" else "Bengaluru",
                    "state": "Karnataka" if COUNTRIES[location] == "India" else location,
                    "country": COUNTRIES[location],
                    "postal": str(rng.randint(100000, 999999)),
                },
            )
            BankAccount.objects.get_or_create(
                employee=emp,
                defaults={
                    "account_name": f"{first} {last}",
                    "account_number": str(rng.randint(10**11, 10**12 - 1)),
                    "ifsc": f"HDFC000{rng.randint(1000, 9999)}",
                    "bank": rng.choice(["HDFC Bank", "ICICI Bank", "Barclays", "Chase"]),
                    "branch": location,
                },
            )
            EmergencyContact.objects.get_or_create(
                employee=emp,
                name=f"{rng.choice(FIRST_NAMES)} {last}",
                defaults={
                    "relation": rng.choice(["Spouse", "Parent", "Sibling"]),
                    "phone": f"+91{rng.randint(7000000000, 9999999999)}",
                    "primary": True,
                },
            )
            Education.objects.get_or_create(
                employee=emp,
                degree=rng.choice(["B.Tech", "B.Sc", "MBA", "M.Tech"]),
                defaults={
                    "institution": rng.choice(["NIT Trichy", "IIT Bombay", "Delhi University",
                                               "University of Leeds", "TU Berlin"]),
                    "field": rng.choice(["Computer Science", "Design", "Commerce", "Economics"]),
                    "from_year": str(join.year - 6),
                    "to_year": str(join.year - 2),
                    "grade": f"{rng.randint(60, 95)}%",
                },
            )
            Experience.objects.get_or_create(
                employee=emp,
                company=rng.choice(["Infosys", "Zoho", "Freshworks", "Shopify", "Stripe"]),
                defaults={
                    "role": rng.choice(titles),
                    "from_date": str(join.year - 3),
                    "to_date": str(join.year),
                    "location": location,
                    "summary": "Delivered cross-functional projects and mentored junior team members.",
                },
            )
            for skill_name in rng.sample(SKILLS, 3):
                EmployeeSkill.objects.get_or_create(employee=emp, skill=skills[skill_name])

            people.append(emp)
        return people

    @staticmethod
    def _role_for(title: str, index: int) -> str:
        if index == 0:
            return "super_admin"
        if index == 1:
            return "org_admin"
        lowered = title.lower()
        if "hr" in lowered or "people" in lowered:
            return "hr"
        if "recruiter" in lowered:
            return "recruiter"
        if "payroll" in lowered:
            return "payroll"
        if "finance" in lowered:
            return "finance"
        if "manager" in lowered or "lead" in lowered:
            return "manager"
        return "employee"

    def _seed_managers(self, people, rng):
        managers = [p for p in people if "Manager" in p.employment.job_title
                    or "Lead" in p.employment.job_title]
        if not managers:
            return
        for emp in people:
            if emp in managers:
                continue
            candidate = rng.choice(managers)
            if emp.employment.manager_id is None and candidate.id != emp.id:
                emp.employment.manager = candidate
                emp.employment.save(update_fields=["manager"])

    def _seed_timeline(self, emp, rng, leave_types):
        # Attendance: last 20 working days.
        if not emp.punches.exists():
            day = date.today()
            punches = []
            while len(punches) < 20:
                if day.weekday() < 5:
                    in_h, in_m = 9, rng.randint(0, 45)
                    hours = Decimal(str(round(rng.uniform(7.0, 9.5), 2)))
                    punches.append(AttendancePunch(
                        employee=emp, date=day,
                        clock_in=time(in_h, in_m),
                        clock_out=time(min(23, in_h + int(hours)), in_m),
                        worked_hours=hours,
                        break_minutes=rng.choice([30, 45, 60]),
                        location=emp.employment.location,
                        status=rng.choices(["present", "wfh", "leave"], [80, 15, 5])[0],
                        shift="General (09:00 - 18:00)",
                    ))
                day -= timedelta(days=1)
            AttendancePunch.objects.bulk_create(punches)

        # Timesheets: last 5 working days.
        if not emp.timesheets.exists():
            entries = []
            day = date.today()
            while len(entries) < 5:
                if day.weekday() < 5:
                    entries.append(TimesheetEntry(
                        employee=emp, date=day,
                        project=rng.choice(PROJECTS),
                        task=rng.choice(["Implementation", "Code review", "Planning", "Support"]),
                        hours=Decimal(str(round(rng.uniform(4, 8), 1))),
                        billable=rng.random() < 0.7,
                        status=rng.choice(["draft", "submitted", "approved"]),
                    ))
                day -= timedelta(days=1)
            TimesheetEntry.objects.bulk_create(entries)

        # Leave requests.
        if not emp.leave_requests.exists():
            for _ in range(rng.randint(1, 3)):
                start = date.today() - timedelta(days=rng.randint(-45, 200))
                days = rng.randint(1, 4)
                LeaveRequest.objects.create(
                    employee=emp,
                    type=rng.choice(leave_types),
                    from_date=start,
                    to_date=start + timedelta(days=days - 1),
                    days=Decimal(days),
                    reason=rng.choice(["Family function", "Medical", "Vacation", "Personal errand"]),
                    status=rng.choices(["approved", "pending", "rejected"], [70, 20, 10])[0],
                    approver=emp.employment.manager,
                )

        # Payslips: last 6 months.
        if not emp.payslips.exists():
            base = emp.employment.salary_base / Decimal(12)
            today = date.today()
            for offset in range(6):
                month_date = (today.replace(day=1) - timedelta(days=30 * offset)).replace(day=1)
                gross = (base * Decimal(str(round(rng.uniform(0.98, 1.08), 3)))).quantize(Decimal("0.01"))
                tax = (gross * Decimal("0.12")).quantize(Decimal("0.01"))
                deductions = (gross * Decimal("0.06")).quantize(Decimal("0.01"))
                payslip = Payslip.objects.create(
                    employee=emp,
                    month=month_date.strftime("%Y-%m"),
                    period=month_date.strftime("%B %Y"),
                    gross=gross,
                    net=gross - tax - deductions,
                    deductions=deductions,
                    tax=tax,
                    status="paid" if offset else "processing",
                    paid_on=month_date + timedelta(days=27) if offset else None,
                )
                PayslipLine.objects.bulk_create([
                    PayslipLine(payslip=payslip, kind="earning", label="Basic",
                                amount=(gross * Decimal("0.6")).quantize(Decimal("0.01"))),
                    PayslipLine(payslip=payslip, kind="earning", label="House Rent Allowance",
                                amount=(gross * Decimal("0.4")).quantize(Decimal("0.01"))),
                    PayslipLine(payslip=payslip, kind="deduction", label="Provident Fund",
                                amount=deductions),
                    PayslipLine(payslip=payslip, kind="deduction", label="Income Tax", amount=tax),
                ])
