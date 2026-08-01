import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  time?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
}

const toneMap: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
};

export function Timeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-4 border-l border-border/70 pl-6", className)}>
      {events.map((e) => {
        const Icon = e.icon;
        return (
          <li key={e.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                toneMap[e.tone ?? "default"],
              )}
            >
              {Icon ? <Icon className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm">{e.title}</p>
              {e.meta && <p className="mt-0.5 text-xs text-muted-foreground">{e.meta}</p>}
              {e.time && <p className="mt-0.5 text-[11px] text-muted-foreground">{e.time}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
