import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterDef {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  actions,
  className,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  actions?: ReactNode;
  className?: string;
}) {
  const hasFilters = filters.some((f) => f.value && f.value !== "all");
  const clear = () => filters.forEach((f) => f.onChange("all"));

  return (
    <div className={cn("flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card p-2.5", className)}>
      {onSearchChange && (
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8 text-sm"
          />
        </div>
      )}
      {filters.map((f) => (
        <Select key={f.id} value={f.value} onValueChange={f.onChange}>
          <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="h-9 text-xs">
          <X className="mr-1 h-3 w-3" /> Clear
        </Button>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
