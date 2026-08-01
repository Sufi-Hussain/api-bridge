// JWT token storage. Uses Web Storage in the browser and a no-op in SSR.
// Kept isolated so the strategy can be swapped (cookies, memory, etc.)
// without touching the axios client.
//
// "Remember me" picks the backing store:
//   - remembered  -> localStorage   (survives browser restarts)
//   - not         -> sessionStorage (cleared when the tab closes)
// The persistence flag itself lives in localStorage so a refresh in a new
// tab can find the right store again.

const ACCESS_KEY = "hrms.access";
const REFRESH_KEY = "hrms.refresh";
const PERSIST_KEY = "hrms.persist";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function persistent(): boolean {
  if (!isBrowser()) return true;
  return window.localStorage.getItem(PERSIST_KEY) !== "0";
}

function store(): Storage | null {
  if (!isBrowser()) return null;
  return persistent() ? window.localStorage : window.sessionStorage;
}

function read(key: string): string | null {
  if (!isBrowser()) return null;
  // Read through both stores: a token written before the flag changed must
  // still be found rather than silently logging the user out.
  return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
}

export const tokenStore = {
  getAccess(): string | null {
    return read(ACCESS_KEY);
  },
  getRefresh(): string | null {
    return read(REFRESH_KEY);
  },
  /** Choose where subsequent tokens are kept. Call before `set()` on login. */
  setPersistence(remember: boolean) {
    if (!isBrowser()) return;
    window.localStorage.setItem(PERSIST_KEY, remember ? "1" : "0");
    // Moving stores: drop anything left in the other one.
    const other = remember ? window.sessionStorage : window.localStorage;
    other.removeItem(ACCESS_KEY);
    other.removeItem(REFRESH_KEY);
  },
  isPersistent(): boolean {
    return persistent();
  },
  set(access: string, refresh?: string | null) {
    const s = store();
    if (!s) return;
    s.setItem(ACCESS_KEY, access);
    if (refresh) s.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (!isBrowser()) return;
    for (const s of [window.localStorage, window.sessionStorage]) {
      s.removeItem(ACCESS_KEY);
      s.removeItem(REFRESH_KEY);
    }
  },
};
