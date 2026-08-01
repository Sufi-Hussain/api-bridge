"""
accounts.services.ui_permissions
================================

Bridges backend RBAC codenames (``employee.read``, ``payroll.write``, …) to the
permission ids the frontend navigation is gated on (``src/config/permissions.ts``:
``ess.profile.view``, ``hr.employees.view``, ``admin.users.view``, ``pay.payslips.view``, …).

Rather than enumerating ~70 ids here (which would drift the moment the frontend
adds a screen), we emit **scope wildcards** such as ``hr.*``. The frontend's
`hasPermission` treats a trailing ``.*`` as a prefix grant, so backend and
frontend stay in sync without a shared hand-maintained table.
"""
from __future__ import annotations

#: Coarse role slug -> UI scopes that role may see.
ROLE_UI_SCOPES: dict[str, tuple[str, ...]] = {
    "employee": ("ess.*",),
    "manager": ("ess.*", "hr.team.*", "hr.approvals.*", "hr.employees.view"),
    "recruiter": ("ess.*", "hr.recruitment.*", "hr.employees.view"),
    "hr": ("ess.*", "hr.*"),
    "payroll": ("ess.*", "pay.*", "hr.employees.view"),
    "finance": ("ess.*", "pay.*"),
    "org_admin": ("ess.*", "hr.*", "pay.*", "admin.*"),
    "admin": ("ess.*", "hr.*", "pay.*", "admin.*"),
    "super_admin": ("*",),
}


def ui_scopes_for_roles(role_slugs) -> list[str]:
    """Union of UI scopes granted by the given role slugs."""
    scopes: set[str] = set()
    for slug in role_slugs or ():
        scopes.update(ROLE_UI_SCOPES.get(slug, ()))
    if "*" in scopes:
        return ["*"]
    return sorted(scopes)
