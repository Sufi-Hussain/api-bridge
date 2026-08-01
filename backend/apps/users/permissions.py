from rest_framework.permissions import BasePermission


class IsSelfOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        return bool(user and (user.is_superuser or obj.pk == user.pk))
