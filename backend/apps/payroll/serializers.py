from rest_framework import serializers

from .models import Payslip, PayslipLine


class PayslipLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayslipLine
        fields = ("id", "kind", "label", "amount")


class PayslipSerializer(serializers.ModelSerializer):
    earnings = serializers.SerializerMethodField()
    deductions_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Payslip
        fields = (
            "id",
            "month",
            "period",
            "gross",
            "net",
            "deductions",
            "tax",
            "status",
            "paid_on",
            "earnings",
            "deductions_breakdown",
        )

    def _lines(self, obj, kind):
        return [
            {"label": ln.label, "amount": ln.amount}
            for ln in obj.lines.all()
            if ln.kind == kind
        ]

    def get_earnings(self, obj):
        return self._lines(obj, PayslipLine.Kind.EARNING)

    def get_deductions_breakdown(self, obj):
        return self._lines(obj, PayslipLine.Kind.DEDUCTION)
