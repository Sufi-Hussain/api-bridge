from rest_framework.permissions import BasePermission


class IsProfileOwnerOrHR(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or getattr(user, "role", None) in {"hr", "admin"}:
            return True
        emp = getattr(obj, "employee", obj)
        return getattr(emp, "user_id", None) == user.id
