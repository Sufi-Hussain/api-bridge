// Auth context + provider. Loads the current user on mount if a token
// is present, refreshes on visibility change, exposes helpers that
// wrap `permissions.ts`, and wires `authService.onUnauthorized` so a
// hard 401 flips the session to "expired" and lets the router redirect.
import * as React from "react";
import { authService } from "@/lib/api/auth";
import { tokenStore } from "@/lib/api/tokens";
import type { AuthSession, AuthUser, RouteAuthMeta } from "./types";
import * as P from "./permissions";

interface AuthContextValue extends AuthSession {
  login: (username: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (r: string) => boolean;
  hasPermission: (p: string) => boolean;
  belongsToOrganization: (orgId: string) => boolean;
  canAccess: (meta: RouteAuthMeta) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [status, setStatus] = React.useState<AuthSession["status"]>("loading");

  const loadMe = React.useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    try {
      const me = (await authService.me()) as AuthUser;
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  React.useEffect(() => {
    loadMe();
    authService.onUnauthorized(() => {
      setUser(null);
      setStatus("expired");
    });
    return () => authService.onUnauthorized(null);
  }, [loadMe]);

  const value: AuthContextValue = {
    user,
    status,
    login: async (username, password, remember = true) => {
      await authService.login({ username, password, remember });
      await loadMe();
    },
    logout: async () => {
      await authService.logout();
      setUser(null);
      setStatus("unauthenticated");
    },
    refresh: loadMe,
    hasRole: (r) => P.hasRole(user, r),
    hasPermission: (p) => P.hasPermission(user, p),
    belongsToOrganization: (o) => P.belongsToOrganization(user, o),
    canAccess: (m) => P.canAccess(user, m),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Convenience conditional renderer for permission-gated UI bits.
export function Can({
  children,
  fallback = null,
  ...meta
}: RouteAuthMeta & { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { canAccess } = useAuth();
  return <>{canAccess(meta) ? children : fallback}</>;
}
