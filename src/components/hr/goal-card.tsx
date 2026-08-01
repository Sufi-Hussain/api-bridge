import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/status-badge";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Target } from "lucide-react";
import type { Goal } from "@/services/hr";
import type { StatusTone } from "@/types";

const tones: Record<Goal["status"], StatusTone> = {
  on_track: "success", at_risk: "warning", off_track: "destructive", completed: "info",
};

export function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug">{goal.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {goal.type} · Weight {goal.weight}% · Due {goal.due}
            </p>
          </div>
          <StatusBadge tone={tones[goal.status]}>{goal.status.replace("_", " ")}</StatusBadge>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-1.5" />
        </div>
        <ul className="space-y-1.5">
          {goal.keyResults.map((kr, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              <Target className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{kr.title}</span>
              <span className="text-muted-foreground">{kr.progress}% / {kr.target}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 border-t border-border/60 pt-2">
          <PersonAvatar name={goal.owner} className="h-6 w-6 text-[10px]" />
          <span className="text-xs text-muted-foreground">{goal.owner}</span>
        </div>
      </CardContent>
    </Card>
  );
}
