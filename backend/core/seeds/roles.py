"""
Idempotent seeder for the built-in role catalogue. Run once per deployment:

    python manage.py shell -c "from core.seeds.roles import seed_system_roles; seed_system_roles()"

You can also call `seed_system_roles(org)` to create per-org copies of the
system roles (useful when onboarding a new tenant).
"""
from __future__ import annotations
from accounts.models import Role, Permission


# codename -> human name, grouped for the admin UI
PERMISSIONS: dict[str, tuple[str, str]] = {
    # Employee
    "employee.read":       ("Read employees", "HR"),
    "employee.write":      ("Create/update employees", "HR"),
    "employee.delete":     ("Delete employees", "HR"),
    "employee.read_self":  ("Read own profile", "Self"),
    "employee.write_self": ("Edit own profile", "Self"),
    # Payroll
    "payroll.read":        ("Read payroll", "Payroll"),
    "payroll.write":       ("Run payroll", "Payroll"),
    "payslip.read_self":   ("View own payslips", "Self"),
    # Leave / Attendance
    "leave.read":          ("Read leave requests", "Leave"),
    "leave.approve":       ("Approve leave", "Leave"),
    "leave.request":       ("Request leave", "Self"),
    "attendance.read":     ("Read attendance", "Attendance"),
    "attendance.clock":    ("Clock in/out", "Self"),
    # Finance
    "finance.read":        ("Read financial data", "Finance"),
    # Recruiting
    "recruitment.read":    ("Read candidates", "Recruitment"),
    "recruitment.write":   ("Manage candidates", "Recruitment"),
    # Org admin
    "org.admin":           ("Administer the organization", "Admin"),
    "org.billing":         ("Manage billing", "Admin"),
    "user.invite":         ("Invite users", "Admin"),
    "role.manage":         ("Manage roles", "Admin"),
}


ROLES: dict[str, tuple[str, list[str]]] = {
    "employee": ("Employee", [
        "employee.read_self", "employee.write_self",
        "payslip.read_self", "leave.request", "attendance.clock",
    ]),
    "manager": ("Manager", [
        "employee.read_self", "employee.write_self",
        "payslip.read_self", "leave.request", "attendance.clock",
        "employee.read", "leave.read", "leave.approve", "attendance.read",
    ]),
    "hr": ("HR", [
        "employee.read", "employee.write", "employee.delete",
        "leave.read", "leave.approve", "attendance.read",
        "recruitment.read", "recruitment.write", "user.invite",
    ]),
    "payroll": ("Payroll", [
        "employee.read", "payroll.read", "payroll.write",
    ]),
    "finance": ("Finance", [
        "payroll.read", "finance.read",
    ]),
    "recruiter": ("Recruiter", [
        "recruitment.read", "recruitment.write",
    ]),
    "org_admin": ("Organization Admin", [
        "org.admin", "org.billing", "user.invite", "role.manage",
        "employee.read", "employee.write",
    ]),
    "super_admin": ("Super Admin", list(PERMISSIONS.keys())),
}


def seed_system_roles(organization=None) -> None:
    # Ensure permissions.
    perms: dict[str, Permission] = {}
    for code, (name, group) in PERMISSIONS.items():
        p, _ = Permission.objects.get_or_create(
            codename=code, defaults={"name": name, "group": group},
        )
        perms[code] = p

    # Ensure roles.
    for slug, (name, codes) in ROLES.items():
        role, _ = Role.objects.get_or_create(
            slug=slug, organization=organization,
            defaults={"name": name, "is_system": True},
        )
        role.permissions.set([perms[c] for c in codes])
