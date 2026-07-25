"""
accounts.middleware
===================

Attaches `request.organization` for each request. Resolution order:
  1. X-Organization-Id header (explicit tenant switch — common for SaaS UI)
  2. User's primary OrganizationMember (is_primary=True)
  3. Any active membership (first)

Add to MIDDLEWARE AFTER AuthenticationMiddleware and any JWT auth middleware.
"""
from __future__ import annotations
from django.utils.deprecation import MiddlewareMixin
from .models import OrganizationMember


class OrganizationMiddleware(MiddlewareMixin):
    HEADER = "HTTP_X_ORGANIZATION_ID"

    def process_request(self, request):
        request.organization = None
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return

        requested_id = request.META.get(self.HEADER)
        qs = OrganizationMember.objects.select_related("organization").filter(
            user=user, status="active"
        )

        if requested_id:
            m = qs.filter(organization_id=requested_id).first()
            if m:
                request.organization = m.organization
                return

        primary = qs.filter(is_primary=True).first() or qs.first()
        if primary:
            request.organization = primary.organization
