// Auth domain types shared across the auth layer.
// Extends the base `User` shape from @/types with fields needed for
// RBAC + multi-tenancy checks on the client.
import type { User } from "@/types";

export interface AuthUser extends User {
  emailVerified?: boolean;
  isSuperAdmin?: boolean;
}

export interface AuthSession {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated" | "expired";
}

// Route metadata consumed by the guard. Attach on route options via
// `staticData` (TanStack Router) or through the `beforeLoad` closure.
export interface RouteAuthMeta {
  requireAuth?: boolean;
  roles?: string[];              // any-of
  permissions?: string[];        // all-of (use permissionsAny for any-of)
  permissionsAny?: string[];
  organizationId?: string;       // must belong to this org
  allowSuperAdmin?: boolean;     // default true
}
