import { Menu, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgSwitcher } from "./org-switcher";
import { NotificationCenter } from "./notification-center";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { Breadcrumbs } from "./breadcrumbs";
import { useUIStore } from "@/stores/ui.store";

export function AppTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const setAiOpen = useUIStore((s) => s.setAiOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/80 px-3 backdrop-blur-md md:px-5">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="hidden lg:block">
        <OrgSwitcher />
      </div>

      <div className="mx-2 hidden h-6 w-px bg-border/70 lg:block" />
      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden h-9 w-64 items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 truncate">Search…</span>
          <kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setCommandOpen(true)}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAiOpen(true)}
          aria-label="AI assistant"
          className="text-primary"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <NotificationCenter />
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-border/70" />
        <UserMenu />
      </div>
    </header>
  );
}
