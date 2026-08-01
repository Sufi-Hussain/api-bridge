import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { StatusTone } from "@/types";

export interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  tone?: StatusTone;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  accent?: string;
}

export function Kanban({ columns, className }: { columns: KanbanColumn[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5", className)}>
      {columns.map((col) => (
        <div key={col.id} className="flex flex-col rounded-xl border border-border/60 bg-muted/30 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", col.accent ?? "bg-primary")} />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{col.cards.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {col.cards.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
                Empty
              </p>
            ) : (
              col.cards.map((c) => (
                <Card key={c.id} className="cursor-grab border-border/60 shadow-sm hover:border-primary/40">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium leading-snug">{c.title}</p>
                    {c.subtitle && <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>}
                    {c.tag && (
                      <div className="mt-2">
                        <StatusBadge tone={c.tone ?? "muted"}>{c.tag}</StatusBadge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
