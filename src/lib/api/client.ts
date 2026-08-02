// Shared axios instance for the HRMS Django backend.
// - Base URL from VITE_API_BASE_URL
// - Attaches JWT access token from tokenStore
// - Transparent 401 refresh via /api/auth/refresh (single-flight)
// - Normalizes errors into ApiError before rejecting

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenStore } from "./tokens";
import { normalizeAxiosError, ApiError } from "./errors";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://16.176.182.210";
  // "http://localhost:8000";

console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("All env vars:", import.meta.env);

// Optional hook the auth module wires up so a hard 401 (no refresh, or
// refresh failed) can redirect / clear session without importing a router
// here.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// ---- request: attach bearer -------------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// ---- response: refresh flow + error normalization ---------------------------
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    // Bypass the shared instance so this request has no Authorization header
    // and does NOT recurse through the response interceptor.
    const { data } = await axios.post(
      `${BASE_URL}/api/auth/refresh`,
      { refresh },
      { headers: { "Content-Type": "application/json" }, timeout: 15_000 },
    );
    const access = data?.access as string | undefined;
    if (!access) return null;
    tokenStore.set(access, data?.refresh ?? refresh);
    return access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    // Never try to refresh a call to the auth endpoints themselves.
    const url = (original?.url ?? "").toString();
    const isAuthCall =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/logout");

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        // Reset after the in-flight refresh settles so the next 401 can retry.
        setTimeout(() => (refreshPromise = null), 0);
      });
      const newToken = await refreshPromise;
      if (newToken) {
        const headers = AxiosHeaders.from(original.headers);
        headers.set("Authorization", `Bearer ${newToken}`);
        original.headers = headers;
        return api.request(original);
      }
      tokenStore.clear();
      onUnauthorized?.();
    }

    return Promise.reject(normalizeAxiosError(error));
  },
);

// Convenience wrappers so services never have to touch AxiosResponse.
export async function apiGet<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.get<T>(url, config);
  return data;
}
export async function apiPost<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.post<T>(url, body, config);
  return data;
}
export async function apiPatch<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.patch<T>(url, body, config);
  return data;
}
export async function apiPut<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.put<T>(url, body, config);
  return data;
}
export async function apiDelete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.delete<T>(url, config);
  return data;
}

// multipart/form-data helper used by document / avatar uploads.
export async function apiUpload<T = unknown>(
  url: string,
  form: FormData,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await api.post<T>(url, form, {
    ...config,
    headers: { ...(config?.headers ?? {}), "Content-Type": "multipart/form-data" },
  });
  return data;
}

export { ApiError };
