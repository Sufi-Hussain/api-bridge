from django.contrib import admin

from .models import (
    Address,
    BankAccount,
    Education,
    EmergencyContact,
    Employee,
    Employment,
    EmployeeSkill,
    Experience,
    FamilyMember,
    Skill,
)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "first_name", "last_name", "work_email", "user")
    search_fields = ("employee_id", "first_name", "last_name", "work_email")
    list_filter = ("gender", "marital_status")


@admin.register(Employment)
class EmploymentAdmin(admin.ModelAdmin):
    list_display = ("employee", "job_title", "department", "grade", "employment_type", "join_date")
    list_filter = ("department", "employment_type", "work_mode", "grade")
    search_fields = ("employee__first_name", "employee__last_name", "job_title", "department")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("employee", "city", "state", "country")
    search_fields = ("employee__first_name", "employee__last_name", "city", "country")


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ("employee", "name", "relation", "phone", "primary")
    list_filter = ("primary",)
    search_fields = ("employee__first_name", "name")


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):
    list_display = ("employee", "name", "relation", "dependent", "covered")
    list_filter = ("dependent", "covered")


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("employee", "degree", "institution", "field", "from_year", "to_year")
    search_fields = ("employee__first_name", "institution", "degree")


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("employee", "company", "role", "from_date", "to_date")
    search_fields = ("employee__first_name", "company", "role")


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ("employee", "bank", "type", "account_number")
    list_filter = ("type", "bank")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(EmployeeSkill)
class EmployeeSkillAdmin(admin.ModelAdmin):
    list_display = ("employee", "skill", "level", "endorsed")
    list_filter = ("level",)
    search_fields = ("employee__first_name", "skill__name")
