from dataclasses import dataclass

from accounts.services.rbac import user_permission_codenames
from accounts.models import OrganizationMember

@dataclass(frozen=True)
class AIContext:
    user: object
    organization: object
    permissions: frozenset[str]
    request_id: str

    def allows(self, permission: str) -> bool:
        return getattr(self.user, "is_superuser", False) or permission in self.permissions


def build_context(request) -> AIContext:
    user = getattr(request, "user", None)
    membership = OrganizationMember.objects.filter(
        user=user,
        status="active"
    ).select_related("organization").first()
    if not membership:
        raise PermissionError("No active organization membership.")

    organization = membership.organization
    # organization = getattr(request, "organization", None)
    # if organization is None:
    #     raise PermissionError("No active organization membership.")
    print(f"Building AIContext for user {request.user} in organization {organization}")
    permissions = frozenset(user_permission_codenames(request.user, organization))
    return AIContext(request.user, organization, permissions, request.headers.get("X-Request-ID", "ai-request"))
