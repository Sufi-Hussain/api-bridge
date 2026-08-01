from __future__ import annotations

from django.db import models

from apps.common.models import UUIDTimestampedModel
from apps.ess.models import Employee


class DocumentItem(UUIDTimestampedModel):
    class Category(models.TextChoices):
        IDENTITY = "identity", "Identity"
        EMPLOYMENT = "employment", "Employment"
        EDUCATION = "education", "Education"
        CERTIFICATE = "certificate", "Certificate"
        TAX = "tax", "Tax"
        MEDICAL = "medical", "Medical"

    class Status(models.TextChoices):
        VERIFIED = "verified", "Verified"
        PENDING = "pending", "Pending"
        EXPIRED = "expired", "Expired"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="documents")
    name = models.CharField(max_length=128)
    category = models.CharField(max_length=16, choices=Category.choices)
    file = models.FileField(upload_to="documents/")
    uploaded_by = models.CharField(max_length=64, default="Self")
    expires_on = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)

    class Meta:
        ordering = ("-created_at",)
