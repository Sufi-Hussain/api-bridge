// Authentication flow. Wraps the four /api/auth/* endpoints and manages
// token lifecycle. The UI should only ever talk to this module for auth.

import type { User } from "@/types";
import { api, apiPost, setUnauthorizedHandler } from "./client";
import { tokenStore } from "./tokens";
import { camelizeKeys } from "./mappers";

export interface LoginInput {
  username: string;
  password: string;
}
export interface TokenPair {
  access: string;
  refresh: string;
}

export const authService = {
  async login(input: LoginInput): Promise<TokenPair> {
    // /api/auth/login uses SimpleJWT's TokenObtainPair — plain username/password.
    const data = await apiPost<TokenPair>("/api/auth/login", input);
    tokenStore.set(data.access, data.refresh);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiPost("/api/auth/logout");
    } finally {
      tokenStore.clear();
    }
  },

  async me(): Promise<User> {
    const { data } = await api.get("/api/auth/me");
    // Backend returns an unspecified shape ("No response body" in the spec).
    // We camelize and coerce to the frontend User contract.
    const raw = camelizeKeys<any>(data ?? {});
    return {
      id: String(raw.id ?? raw.userId ?? raw.employeeId ?? ""),
      name:
        raw.name ||
        [raw.firstName, raw.lastName].filter(Boolean).join(" ").trim() ||
        raw.username ||
        "",
      email: raw.email ?? raw.workEmail ?? "",
      jobTitle: raw.jobTitle ?? raw.title ?? "",
      department: raw.department ?? "",
      employeeId: String(raw.employeeId ?? raw.empCode ?? ""),
      roles: Array.isArray(raw.roles) ? raw.roles : raw.role ? [raw.role] : [],
      permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
      organizationId: String(raw.organizationId ?? raw.tenantId ?? ""),
    };
  },

  async refresh(): Promise<string | null> {
    const refresh = tokenStore.getRefresh();
    if (!refresh) return null;
    const data = await apiPost<{ access: string; refresh?: string }>(
      "/api/auth/refresh",
      { refresh },
    );
    tokenStore.set(data.access, data.refresh ?? refresh);
    return data.access;
  },

  isAuthenticated(): boolean {
    return !!tokenStore.getAccess();
  },

  onUnauthorized(handler: (() => void) | null) {
    setUnauthorizedHandler(handler);
  },
};
