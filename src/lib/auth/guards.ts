// Route guard for TanStack Router. Import into a route's `beforeLoad`
// or attach via a pathless `_authenticated` layout route:
//
//   export const Route = createFileRoute("/_authenticated")({
//     beforeLoad: guardRoute({ requireAuth: true }),
//     component: () => <Outlet />,
//   });
//
// Works with SSR: token presence + a lightweight /me probe run before
// rendering. Redirects handled through TanStack `redirect()` throws.

import { redirect } from "@tanstack/react-router";
import { authService } from "@/lib/api/auth";
import { tokenStore } from "@/lib/api/tokens";
import { canAccess } from "./permissions";
import type { AuthUser, RouteAuthMeta } from "./types";

interface GuardCtx {
  location: { href: string; pathname: string };
}

async function loadUser(): Promise<AuthUser | null> {
  if (!tokenStore.getAccess()) return null;
  try {
    return (await authService.me()) as AuthUser;
  } catch {
    return null;
  }
}

export function guardRoute(meta: RouteAuthMeta) {
  return async ({ location }: GuardCtx) => {
    const user = await loadUser();

    if (meta.requireAuth && !user) {
      // Distinguish "never signed in" vs "session expired": if a refresh
      // token is present but /me failed, treat it as expired.
      const hadSession = !!tokenStore.getRefresh();
      throw redirect({
        to: hadSession ? "/auth/session-expired" : "/auth/login",
        search: { redirect: location.href },
      });
    }

    if (user && !canAccess(user, meta)) {
      throw redirect({ to: "/auth/unauthorized" });
    }

    return { user };
  };
}

// Redirect authenticated users away from public-only routes (login, register).
export function guardPublicOnly(to = "/") {
  return async () => {
    const user = await loadUser();
    if (user) throw redirect({ to });
    return { user: null };
  };
}
