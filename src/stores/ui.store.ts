import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  commandOpen: boolean;
  aiOpen: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setCommandOpen: (open: boolean) => void;
  setAiOpen: (open: boolean) => void;
  applyTheme: () => void;
}

const STORAGE_KEY = "ess-theme";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function resolveDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "system",
  commandOpen: false,
  aiOpen: false,
  setTheme: (t) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, t);
    }
    set({ theme: t });
    get().applyTheme();
  },
  toggleTheme: () => {
    const isDark = document.documentElement.classList.contains("dark");
    get().setTheme(isDark ? "light" : "dark");
  },
  setCommandOpen: (open) => set({ commandOpen: open }),
  setAiOpen: (open) => set({ aiOpen: open }),
  applyTheme: () => {
    if (typeof document === "undefined") return;
    const t = get().theme;
    const dark = resolveDark(t);
    document.documentElement.classList.toggle("dark", dark);
  },
}));

export function hydrateTheme() {
  const t = readStoredTheme();
  useUIStore.setState({ theme: t });
  useUIStore.getState().applyTheme();
}
