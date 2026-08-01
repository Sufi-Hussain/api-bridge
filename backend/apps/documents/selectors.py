from apps.ess.selectors import get_employee_for_user

from .models import DocumentItem


def my_documents(user):
    emp = get_employee_for_user(user)
    if not emp:
        return DocumentItem.objects.none()
    return DocumentItem.objects.filter(employee=emp)
