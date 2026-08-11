from __future__ import annotations

from rest_framework import serializers

from .models import Asset, AssetRequest, SoftwareLicense


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = (
            "id",
            "name",
            "category",
            "serial",
            "assigned_on",
            "condition",
            "warranty_end",
            "value",
            "status",
        )


class AssetRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetRequest
        fields = ("id", "category", "justification", "status", "requested_on")
        read_only_fields = ("id", "status", "requested_on")


class SoftwareLicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoftwareLicense
        fields = ("id", "name", "vendor", "seats_total", "seats_used", "renewal_date")
