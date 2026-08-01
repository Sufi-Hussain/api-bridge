import { Building2, Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

export function OrgSwitcher() {
  const orgs = useAuthStore((s) => s.organizations);
  const activeId = useAuthStore((s) => s.activeOrgId);
  const setActive = useAuthStore((s) => s.setActiveOrg);
  const active = orgs.find((o) => o.id === activeId) ?? orgs[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2 rounded-lg border-border/70 px-2.5 text-sm font-medium"
          aria-label="Switch organization"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          <span className="max-w-[140px] truncate">{active.name}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((org) => (
          <DropdownMenuItem key={org.id} onSelect={() => setActive(org.id)}>
            <Building2 className="mr-2 h-4 w-4 opacity-70" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{org.name}</p>
              <p className="truncate text-xs text-muted-foreground">{org.domain}</p>
            </div>
            {org.id === activeId && <Check className="ml-2 h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
