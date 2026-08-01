import { Card, CardContent } from "@/components/ui/card";
import { PersonAvatar } from "@/components/common/person-avatar";
import { StatusBadge } from "@/components/common/status-badge";
import { Star, MapPin, Building2 } from "lucide-react";
import type { Candidate } from "@/services/hr";
import { cn } from "@/lib/utils";

const stageTone = {
  sourced: "muted", screen: "info", interview: "info", assessment: "warning",
  offer: "success", hired: "success", rejected: "destructive", withdrew: "muted",
} as const;

export function CandidateCard({ candidate, onClick, className }: { candidate: Candidate; onClick?: () => void; className?: string }) {
  return (
    <Card
      onClick={onClick}
      className={cn("cursor-pointer border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md", className)}
    >
      <CardContent className="space-y-2.5 p-4">
        <div className="flex items-start gap-3">
          <PersonAvatar name={candidate.name} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{candidate.name}</p>
            <p className="truncate text-xs text-muted-foreground">{candidate.role}</p>
          </div>
          <StatusBadge tone={stageTone[candidate.stage]}>{candidate.stage}</StatusBadge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {candidate.currentCompany}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {candidate.location}</span>
          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" /> {candidate.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{candidate.yearsExp} yrs · {candidate.noticeDays}d notice</span>
          <span>via {candidate.source}</span>
        </div>
      </CardContent>
    </Card>
  );
}
