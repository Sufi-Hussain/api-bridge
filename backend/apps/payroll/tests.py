from io import BytesIO
from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.accounts.models import User
from apps.ess.models import Employee
from .models import Payslip
from .views import PayslipViewSet


class PayrollTests(TestCase):
    def test_import(self):
        from . import views  # noqa: F401

    def setUp(self):
        self.user = User.objects.create_user(username="employee", email="employee@example.com", password="password")
        self.other = User.objects.create_user(username="other", email="other@example.com", password="password")
        self.employee = Employee.objects.create(user=self.user, employee_id="EMP-1", first_name="A", last_name="Employee", work_email="employee@example.com")
        self.other_employee = Employee.objects.create(user=self.other, employee_id="EMP-2", first_name="B", last_name="Employee", work_email="other@example.com")
        self.payslip = Payslip.objects.create(employee=self.employee, month="2026-06", period="June 2026", gross=100, net=80, deductions=10, tax=10)
        Payslip.objects.create(employee=self.other_employee, month="2026-06", period="June 2026", gross=200, net=160, deductions=20, tax=20)

    def test_list_is_scoped_to_authenticated_employee(self):
        request = APIRequestFactory().get("/api/payroll/payslips/")
        force_authenticate(request, user=self.user)
        response = PayslipViewSet.as_view({"get": "list"})(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(str(response.data[0]["id"]), str(self.payslip.id))

    @patch("apps.payroll.views.payslip_pdf")
    def test_pdf_is_scoped_to_employee(self, pdf):
        pdf.return_value = BytesIO(b"pdf")
        request = APIRequestFactory().get(f"/api/payroll/payslips/{self.payslip.id}/pdf/")
        force_authenticate(request, user=self.other)
        response = PayslipViewSet.as_view({"get": "pdf"})(request, pk=self.payslip.id)
        self.assertEqual(response.status_code, 404)
