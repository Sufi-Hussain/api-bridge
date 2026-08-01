import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { cn } from "@/lib/utils";

export interface Metric {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: string; direction: "up" | "down" | "flat" };
}

export function MetricsGrid({
  metrics,
  columns = 4,
  className,
}: {
  metrics: Metric[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const cols: Record<number, string> = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-5",
    6: "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
  };
  return (
    <div className={cn("grid grid-cols-1 gap-4", cols[columns], className)}>
      {metrics.map((m, i) => (
        <StatCard key={i} {...m} />
      ))}
    </div>
  );
}
