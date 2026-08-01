from rest_framework import serializers

from .models import DocumentItem


class DocumentItemSerializer(serializers.ModelSerializer):
    size = serializers.SerializerMethodField()
    uploaded = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = DocumentItem
        fields = (
            "id",
            "name",
            "category",
            "file",
            "size",
            "uploaded",
            "uploaded_by",
            "expires_on",
            "status",
        )
        read_only_fields = ("uploaded", "size")

    def get_size(self, obj) -> str:
        try:
            b = obj.file.size
        except Exception:
            return ""
        for unit in ("B", "KB", "MB", "GB"):
            if b < 1024:
                return f"{b:.0f} {unit}"
            b /= 1024
        return f"{b:.1f} TB"
