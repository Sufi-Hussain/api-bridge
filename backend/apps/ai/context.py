from dataclasses import dataclass

from accounts.services.rbac import user_permission_codenames


@dataclass(frozen=True)
class AIContext:
    user: object
    organization: object
    permissions: frozenset[str]
    request_id: str

    def allows(self, permission: str) -> bool:
        return getattr(self.user, "is_superuser", False) or permission in self.permissions


def build_context(request) -> AIContext:
    organization = getattr(request, "organization", None)
    if organization is None:
        raise PermissionError("No active organization membership.")
    permissions = frozenset(user_permission_codenames(request.user, organization))
    return AIContext(request.user, organization, permissions, request.headers.get("X-Request-ID", "ai-request"))
