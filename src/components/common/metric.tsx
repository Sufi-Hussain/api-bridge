import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
}

const tones: Record<NonNullable<MetricProps["tone"]>, string> = {
  default: "bg-muted/40 text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
};

export function Metric({ icon: Icon, label, value, sublabel, tone = "default", className }: MetricProps) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tones[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight">{value}</p>
          {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}
