from __future__ import annotations

from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "avatar",
            "is_active",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined", "is_active")


class MeSerializer(UserSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("permissions",)

    def get_permissions(self, obj: User) -> list[str]:
        return sorted(obj.get_all_permissions())
