from apps.ess.models import Employee

from .models import Department


def all_departments():
    return Department.objects.all()


def all_employees():
    return Employee.objects.select_related("employment").all()
