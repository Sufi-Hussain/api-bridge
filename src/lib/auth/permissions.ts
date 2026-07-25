// Pure permission / role / org helpers. No React, no router — safe to
// import from loaders, guards, and components alike.
import type { AuthUser, RouteAuthMeta } from "./types";

export const isAuthenticated = (u: AuthUser | null | undefined): u is AuthUser =>
  !!u && !!u.id;

export const isSuperAdmin = (u: AuthUser | null | undefined) =>
  !!u?.isSuperAdmin || (u?.roles ?? []).includes("super_admin");

export function hasRole(u: AuthUser | null | undefined, role: string): boolean {
  if (!u) return false;
  if (isSuperAdmin(u)) return true;
  return (u.roles ?? []).includes(role);
}

export function hasAnyRole(u: AuthUser | null | undefined, roles: string[]): boolean {
  if (!roles?.length) return true;
  return roles.some((r) => hasRole(u, r));
}

export function hasPermission(u: AuthUser | null | undefined, perm: string): boolean {
  if (!u) return false;
  if (isSuperAdmin(u)) return true;
  return (u.permissions ?? []).includes(perm);
}

export function hasAllPermissions(u: AuthUser | null | undefined, perms: string[]): boolean {
  if (!perms?.length) return true;
  return perms.every((p) => hasPermission(u, p));
}

export function hasAnyPermission(u: AuthUser | null | undefined, perms: string[]): boolean {
  if (!perms?.length) return true;
  return perms.some((p) => hasPermission(u, p));
}

export function belongsToOrganization(u: AuthUser | null | undefined, orgId: string): boolean {
  if (!u) return false;
  if (isSuperAdmin(u)) return true;
  return u.organizationId === orgId;
}

// Single entry point used by guards and UI (`<Can .../>` style checks).
export function canAccess(u: AuthUser | null | undefined, meta: RouteAuthMeta): boolean {
  if (meta.requireAuth && !isAuthenticated(u)) return false;
  if (meta.allowSuperAdmin !== false && isSuperAdmin(u)) return true;
  if (meta.roles && !hasAnyRole(u, meta.roles)) return false;
  if (meta.permissions && !hasAllPermissions(u, meta.permissions)) return false;
  if (meta.permissionsAny && !hasAnyPermission(u, meta.permissionsAny)) return false;
  if (meta.organizationId && !belongsToOrganization(u, meta.organizationId)) return false;
  return true;
}
