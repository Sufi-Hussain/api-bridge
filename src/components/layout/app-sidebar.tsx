import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION } from "@/config/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasPermission = useAuthStore((s) => s.hasPermission);

  // Auto-open the group that contains the active route
  const initialOpen = useMemo(() => {
    const set = new Set<string>();
    for (const section of NAVIGATION) {
      for (const item of section.items) {
        if (item.children?.some((c) => c.path === pathname)) set.add(item.label);
      }
    }
    return set;
  }, [pathname]);

  const [open, setOpen] = useState<Set<string>>(initialOpen);

  const toggle = (label: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <nav className="scrollbar-thin flex h-full flex-col gap-4 overflow-y-auto px-3 py-4">
      {NAVIGATION.map((section) => {
        const visibleItems = section.items.filter((i) => hasPermission(i.permission));
        if (visibleItems.length === 0) return null;
        return (
          <div key={section.label}>
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50">
              {section.label}
            </div>
            <ul className="flex flex-col gap-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === pathname;
                const hasChildren = !!item.children?.length;
                const isOpen = open.has(item.label);
                const childActive = item.children?.some((c) => c.path === pathname);

                if (!hasChildren) {
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.path!}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0] shadow-primary",
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" />}
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggle(item.label)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        childActive && "text-sidebar-accent-foreground",
                      )}
                      aria-expanded={isOpen}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" />}
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 opacity-60 transition-transform",
                          isOpen && "rotate-90",
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="overflow-hidden pl-6"
                        >
                          {item.children!.map((c) => {
                            const cActive = c.path === pathname;
                            return (
                              <li key={c.label}>
                                <Link
                                  to={c.path!}
                                  onClick={onNavigate}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                                    "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    cActive &&
                                      "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                                  )}
                                >
                                  <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                                  <span className="truncate">{c.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
