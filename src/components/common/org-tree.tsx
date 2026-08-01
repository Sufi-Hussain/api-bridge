import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { OrgNode } from "@/services/_mocks/hr-mock";

function Node({ node, root }: { node: OrgNode; root?: boolean }) {
  const inits = node.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "flex w-56 flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-3 text-center shadow-sm",
          root && "border-primary/40 bg-primary/5",
        )}
      >
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {inits}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-semibold leading-tight">{node.name}</p>
        <p className="text-[11px] text-muted-foreground">{node.title}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {node.department}
        </span>
      </div>
      {node.reports && node.reports.length > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          <div className="flex flex-wrap items-start justify-center gap-6 border-t border-border/60 pt-4">
            {node.reports.map((r) => (
              <Node key={r.id} node={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgTree({ root }: { root: OrgNode }) {
  return (
    <div className="overflow-x-auto p-2">
      <Node node={root} root />
    </div>
  );
}
