import { create } from "zustand";
import type { Organization, User } from "@/types";

/**
 * UI identity store.
 *
 * This store is a *projection* of the real session held by
 * `AuthProvider` (src/lib/auth/context.tsx) — it exists only so that layout
 * chrome (sidebar, topbar, org switcher) can read permissions synchronously
 * without threading context through every component.
 *
 * It is hydrated by `AuthProvider` via `syncAuthStore()` whenever `/api/auth/me`
 * resolves, and cleared on logout. It contains NO hardcoded permissions:
 * an unauthenticated user has an empty permission set, so permission-gated
 * navigation stays hidden until the backend says otherwise.
 */

const ANONYMOUS: User = {
  id: "",
  name: "",
  email: "",
  jobTitle: "",
  department: "",
  employeeId: "",
  avatarUrl: undefined,
  roles: [],
  permissions: [],
  organizationId: "",
};

interface AuthState {
  user: User;
  organizations: Organization[];
  activeOrgId: string;
  isAuthenticated: boolean;
  setActiveOrg: (id: string) => void;
  hasPermission: (permission?: string) => boolean;
  hasRole: (role: string) => boolean;
  /** Called by AuthProvider — do not call from components. */
  setSession: (user: User | null, organizations?: Organization[]) => void;
}

const isSuperAdmin = (u: User) =>
  (u.roles as string[]).includes("super_admin") || (u.roles as string[]).includes("admin");

export const useAuthStore = create<AuthState>((set, get) => ({
  user: ANONYMOUS,
  organizations: [],
  activeOrgId: "",
  isAuthenticated: false,
  setActiveOrg: (id) => set({ activeOrgId: id }),
  hasPermission: (permission) => {
    if (!permission) return true;
    const u = get().user;
    if (isSuperAdmin(u)) return true;
    return u.permissions.includes(permission);
  },
  hasRole: (role) => (get().user.roles as string[]).includes(role),
  setSession: (user, organizations) =>
    set({
      user: user ?? ANONYMOUS,
      isAuthenticated: !!user?.id,
      organizations: organizations ?? (get().organizations.length ? get().organizations : []),
      activeOrgId: user?.organizationId ?? "",
    }),
}));

/** Bridge used by AuthProvider so the store never imports React context. */
export function syncAuthStore(user: User | null, organizations?: Organization[]) {
  useAuthStore.getState().setSession(user, organizations);
}
