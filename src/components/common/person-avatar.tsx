import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function PersonAvatar({
  name,
  className,
  size = "sm",
}: {
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizeMap = { xs: "h-6 w-6 text-[10px]", sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base" };
  const palette = ["bg-chart-1/20 text-chart-1", "bg-chart-2/20 text-chart-2", "bg-chart-3/20 text-chart-3", "bg-chart-4/20 text-chart-4", "bg-chart-5/20 text-chart-5"];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return (
    <Avatar className={cn(sizeMap[size], className)}>
      <AvatarFallback className={cn("font-semibold", palette[idx])}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
