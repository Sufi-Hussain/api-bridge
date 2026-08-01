import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { FilterToolbar } from "@/components/hr/filter-toolbar";
import { GoalCard } from "@/components/hr/goal-card";
import { Button } from "@/components/ui/button";
import { performanceService, type Goal } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/performance/goals")({
  head: () => ({
    meta: [
      { title: "Goals & OKRs · HireChamps" },
      { name: "description", content: "Company, team and individual OKRs — with key results, health and ownership." },
      { property: "og:title", content: "Goals & OKRs · HireChamps" },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => { performanceService.goals().then(setGoals); }, []);

  const filtered = useMemo(() => goals.filter((g) =>
    (status === "all" || g.status === status) && (type === "all" || g.type === type),
  ), [goals, status, type]);

  const stats = {
    total: goals.length,
    onTrack: goals.filter((g) => g.status === "on_track").length,
    atRisk: goals.filter((g) => g.status === "at_risk").length,
    completed: goals.filter((g) => g.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals & OKRs"
        description="Every objective, key result and owner — with health and progress tracking."
        breadcrumbs={[{ label: "HR" }, { label: "Performance" }, { label: "Goals" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New goal</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Target, label: "Total goals", value: stats.total, hint: "Q4 · 2026" },
          { icon: TrendingUp, label: "On track", value: stats.onTrack, hint: `${Math.round((stats.onTrack/stats.total)*100)}%` },
          { icon: AlertTriangle, label: "At risk", value: stats.atRisk, hint: "Need attention" },
          { icon: CheckCircle2, label: "Completed", value: stats.completed, hint: "This cycle" },
        ]}
      />

      <FilterToolbar
        filters={[
          { id: "status", label: "Status", value: status, onChange: setStatus, options: [
            { value: "on_track", label: "On track" }, { value: "at_risk", label: "At risk" },
            { value: "off_track", label: "Off track" }, { value: "completed", label: "Completed" },
          ] },
          { id: "type", label: "Type", value: type, onChange: setType, options: [
            { value: "company", label: "Company" }, { value: "team", label: "Team" }, { value: "individual", label: "Individual" },
          ] },
        ]}
      />

      <SectionCard title={`${filtered.length} goals`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => <GoalCard key={g.id} goal={g} />)}
        </div>
      </SectionCard>
    </div>
  );
}
