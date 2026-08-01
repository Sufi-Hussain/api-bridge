import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface AvatarGroupPerson {
  name: string;
  color?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AvatarGroup({
  people,
  max = 5,
  size = "sm",
  className,
}: {
  people: AvatarGroupPerson[];
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const visible = people.slice(0, max);
  const extra = people.length - visible.length;
  const dim = size === "xs" ? "h-6 w-6 text-[10px]" : size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";
  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((p) => (
        <Avatar
          key={p.name}
          className={cn(dim, "ring-2 ring-background")}
          title={p.name}
        >
          <AvatarFallback className="bg-muted font-medium text-muted-foreground">
            {initials(p.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <span
          className={cn(
            dim,
            "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
