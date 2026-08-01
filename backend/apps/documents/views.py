from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from apps.ess.selectors import get_employee_for_user

from .selectors import my_documents
from .serializers import DocumentItemSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentItemSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ("category", "status")

    def get_queryset(self):
        return my_documents(self.request.user)

    def perform_create(self, serializer):
        serializer.save(employee=get_employee_for_user(self.request.user))
