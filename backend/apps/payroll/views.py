from django.http import FileResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .actions import email_payslip, payslip_pdf

from .selectors import my_payslips
from .serializers import PayslipSerializer


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
