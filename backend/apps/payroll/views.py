from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .selectors import my_payslips
from .serializers import PayslipSerializer


class PayslipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayslipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return my_payslips(self.request.user)
