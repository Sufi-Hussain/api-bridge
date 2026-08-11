"""ESS-facing serializers. Field names mirror the frontend contracts
(snake_case here; the frontend camelizes on receipt)."""
from __future__ import annotations

from rest_framework import serializers

from .models import Benefit, BenefitEnrollment, ExpenseClaim, ExpenseReceipt, Loan, TravelRequest


class BenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benefit
        fields = (
            "id",
            "name",
            "category",
            "provider",
            "coverage",
            "premium",
            "employer_contribution",
            "renewal_date",
        )


class MyBenefitSerializer(serializers.ModelSerializer):
    """Flattened enrollment + benefit — matches the frontend `Benefit`."""

    name = serializers.CharField(source="benefit.name", read_only=True)
    category = serializers.CharField(source="benefit.category", read_only=True)
    provider = serializers.CharField(source="benefit.provider", read_only=True)
    coverage = serializers.CharField(source="benefit.coverage", read_only=True)
    premium = serializers.DecimalField(
        source="benefit.premium", max_digits=10, decimal_places=2, read_only=True
    )
    employer_contribution = serializers.DecimalField(
        source="benefit.employer_contribution", max_digits=10, decimal_places=2, read_only=True
    )
    renewal_date = serializers.DateField(source="benefit.renewal_date", read_only=True)

    class Meta:
        model = BenefitEnrollment
        fields = (
            "id",
            "name",
            "category",
            "provider",
            "coverage",
            "status",
            "renewal_date",
            "premium",
            "employer_contribution",
            "claims",
            "usage",
            "enrolled_on",
        )


class EnrollSerializer(serializers.Serializer):
    benefit_id = serializers.UUIDField()


class ExpenseReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseReceipt
        fields = ("id", "file", "caption")
        read_only_fields = ("id",)


class ExpenseClaimSerializer(serializers.ModelSerializer):
    receipt_count = serializers.IntegerField(read_only=True)
    receipts = ExpenseReceiptSerializer(many=True, read_only=True)

    class Meta:
        model = ExpenseClaim
        fields = (
            "id",
            "title",
            "category",
            "amount",
            "currency",
            "date",
            "status",
            "approver",
            "notes",
            "receipt_count",
            "receipts",
        )
        read_only_fields = ("id", "status", "approver", "receipt_count", "receipts")


class TravelRequestSerializer(serializers.ModelSerializer):
    from_date = serializers.DateField()
    to_date = serializers.DateField()

    class Meta:
        model = TravelRequest
        fields = (
            "id",
            "destination",
            "purpose",
            "from_date",
            "to_date",
            "estimated_cost",
            "status",
            "approver",
        )
        read_only_fields = ("id", "status", "approver")


class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = (
            "id",
            "type",
            "principal",
            "outstanding",
            "emi",
            "tenure_months",
            "interest_rate",
            "start_date",
            "status",
        )
