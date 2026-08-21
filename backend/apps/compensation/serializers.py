from rest_framework import serializers

from .models import Promotion, SalaryBand, SalaryRevision


class SalaryBandSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryBand
        fields = "__all__"
        read_only_fields = ("organization",)


class PromotionSerializer(serializers.ModelSerializer):
    hike_pct = serializers.ReadOnlyField()

    class Meta:
        model = Promotion
        fields = "__all__"
        read_only_fields = ("organization", "hike_pct")


class SalaryRevisionSerializer(serializers.ModelSerializer):
    hike_pct = serializers.ReadOnlyField()

    class Meta:
        model = SalaryRevision
        fields = "__all__"
        read_only_fields = ("organization", "hike_pct")
