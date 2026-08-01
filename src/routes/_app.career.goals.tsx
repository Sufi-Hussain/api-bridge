import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { essService, type Goal } from "@/services/ess";

export const Route = createFileRoute("/_app/career/goals")({
  head: () => ({
    meta: [
      { title: "Goals & OKRs · HireChamps" },
      { name: "description", content: "Personal, team and career goals with key results and progress tracking." },
      { property: "og:title", content: "Goals & OKRs" },
    ],
  }),
  component: GoalsPage,
});

const STATUS_TONE: Record<Goal["status"], "success" | "warning" | "destructive" | "info"> = {
  achieved: "success", "on-track": "info", "at-risk": "warning", behind: "destructive",
};

function GoalsPage() {
  const [rows, setRows] = useState<Goal[]>([]);
  useEffect(() => { essService.getGoals().then(setRows); }, []);

  const onTrack = rows.filter((g) => g.status === "on-track" || g.status === "achieved").length;
  const atRisk = rows.filter((g) => g.status === "at-risk" || g.status === "behind").length;
  const avg = rows.length ? Math.round(rows.reduce((s, g) => s + g.progress * (g.weight / 100), 0) / (rows.reduce((s, g) => s + g.weight, 0) / 100)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals & OKRs"
        description="Your objectives for the cycle. Update progress weekly to keep your manager in sync."
        breadcrumbs={[{ label: "Workplace" }, { label: "Career" }, { label: "Goals" }]}
        actions={<Button size="sm"><Target className="mr-1.5 h-3.5 w-3.5" /> Add goal</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Target} label="Total goals" value={rows.length} />
        <StatCard icon={CheckCircle2} label="On track" value={onTrack} hint="Achieved + on-track" />
        <StatCard icon={AlertTriangle} label="Needs attention" value={atRisk} hint="At risk / behind" />
        <StatCard icon={TrendingUp} label="Weighted progress" value={`${avg}%`} hint="Across all goals" />
      </div>

      <div className="space-y-4">
        {rows.map((g) => (
          <SectionCard
            key={g.id}
            title={g.title}
            action={
              <div className="flex items-center gap-2">
                <StatusBadge tone={STATUS_TONE[g.status]}>{g.status}</StatusBadge>
                <span className="text-xs text-muted-foreground">Weight {g.weight}%</span>
              </div>
            }
          >
            <p className="mb-3 text-sm text-muted-foreground">{g.description}</p>
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium capitalize">{g.category} · Due {new Date(g.dueDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="text-muted-foreground">{g.progress}%</span>
              </div>
              <Progress value={g.progress} className="h-1.5" />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Key results</p>
              <ul className="space-y-2">
                {g.keyResults.map((kr) => (
                  <li key={kr.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{kr.text}</span>
                      <span className="text-xs text-muted-foreground">{kr.progress}%</span>
                    </div>
                    <Progress value={kr.progress} className="h-1" />
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
