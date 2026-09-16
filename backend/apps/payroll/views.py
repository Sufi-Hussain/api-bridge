from django.http import FileResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .actions import email_payslip, payslip_pdf
from .models import Payslip
from .selectors import my_payslips
from .serializers import PayslipSerializer
from .selectors import get_next_payday as _emp_next_payday
from apps.ess.selectors import get_employee_for_user


class PayslipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayslipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return my_payslips(self.request.user).prefetch_related("lines")

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        payslip = self.get_object()
        return FileResponse(payslip_pdf(payslip), as_attachment=True, filename=f"payslip-{payslip.month}.pdf", content_type="application/pdf")

    @action(detail=True, methods=["post"])
    def email(self, request, pk=None):
        payslip = self.get_object()
        recipient = payslip.employee.work_email
        if not recipient:
            return Response({"detail": "No registered work email is available."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            email_payslip(payslip, recipient)
        except Exception:
            return Response({"detail": "The payslip email could not be sent."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"detail": "Payslip sent to your registered work email."})

    @action(detail=False, methods=["get"])
    def calendar(self, request):
        """Payroll calendar: cutoffs, runs, payouts, filings for current org."""
        emp = get_employee_for_user(request.user)

        events = []
        if emp:
            npd = _emp_next_payday(emp)
            if npd:
                events.append({
                    "id": "next-payout",
                    "label": f"Salary payout · {npd['label']}",
                    "date_iso": npd["date"],
                    "kind": "payout",
                })

        processing_run = Payslip.objects.filter(
            employee__organization=request.organization,
            status="processing",
        ).order_by("-month").first()
        if processing_run:
            events.append({
                "id": f"run-{processing_run.month}",
                "label": f"Payroll run · {processing_run.month}",
                "date_iso": processing_run.created_at.date().isoformat(),
                "kind": "run",
            })

        return Response({"results": events})