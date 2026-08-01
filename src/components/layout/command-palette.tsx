import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FLAT_NAV, NAVIGATION } from "@/config/navigation";
import { useUIStore } from "@/stores/ui.store";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const setAiOpen = useUIStore((s) => s.setAiOpen);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUIStore.getState().commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const grouped = NAVIGATION.map((s) => ({
    label: s.label,
    items: FLAT_NAV.filter((n) => n.section === s.label),
  }));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions, people…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="AI">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              setAiOpen(true);
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Ask the AI Assistant
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        {grouped.map((g) => (
          <CommandGroup key={g.label} heading={g.label}>
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.path}
                  value={`${g.label} ${item.parent ?? ""} ${item.label} ${item.path}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: item.path });
                  }}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4 opacity-70" />}
                  <span>{item.label}</span>
                  {item.parent && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.parent}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
