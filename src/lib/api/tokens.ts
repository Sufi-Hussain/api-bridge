// JWT token storage. Uses localStorage in the browser and a no-op in SSR.
// Kept isolated so the strategy can be swapped (cookies, memory, etc.)
// without touching the axios client.

const ACCESS_KEY = "hrms.access";
const REFRESH_KEY = "hrms.refresh";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export const tokenStore = {
  getAccess(): string | null {
    return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefresh(): string | null {
    return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  set(access: string, refresh?: string | null) {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
