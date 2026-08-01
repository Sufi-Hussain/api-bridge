import type { StatusTone } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneStyles: Record<StatusTone, string> = {
  default: "bg-secondary text-secondary-foreground border-transparent",
  success:
    "bg-success/15 text-success border-success/30 [color:oklch(0.42_0.15_155)] dark:[color:oklch(0.85_0.16_155)]",
  warning:
    "bg-warning/20 text-warning-foreground border-warning/30 [color:oklch(0.42_0.15_75)] dark:[color:oklch(0.88_0.15_80)]",
  destructive:
    "bg-destructive/15 text-destructive border-destructive/30",
  info:
    "bg-info/15 border-info/30 [color:oklch(0.42_0.13_235)] dark:[color:oklch(0.82_0.13_235)]",
  muted: "bg-muted text-muted-foreground border-transparent",
};

export function StatusBadge({
  tone = "default",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", toneStyles[tone], className)}
    >
      {children}
    </Badge>
  );
}
