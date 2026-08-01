import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Repeat, Users, CheckCircle2, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { performanceService, type PerformanceCycle } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/performance/cycles")({
  head: () => ({
    meta: [
      { title: "Performance Cycles · HireChamps" },
      { name: "description", content: "Run and monitor performance review cycles from launch through calibration." },
      { property: "og:title", content: "Performance Cycles · HireChamps" },
    ],
  }),
  component: CyclesPage,
});

const tone: Record<PerformanceCycle["status"], StatusTone> = {
  upcoming: "muted", self_review: "info", manager_review: "warning", calibration: "warning", closed: "success",
};

function CyclesPage() {
  const [list, setList] = useState<PerformanceCycle[]>([]);
  useEffect(() => { performanceService.cycles().then(setList); }, []);

  const active = list.filter((c) => c.status !== "closed" && c.status !== "upcoming");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Cycles"
        description="Every review cycle — self assessment, manager review, calibration and sharing."
        breadcrumbs={[{ label: "HR" }, { label: "Performance" }, { label: "Cycles" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Launch cycle</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Repeat, label: "Total cycles", value: list.length, hint: "All time" },
          { icon: Users, label: "Active", value: active.length, hint: "In flight" },
          { icon: CheckCircle2, label: "Reviewers", value: 1189, hint: "Enabled" },
          { icon: CheckCircle2, label: "On-time rate", value: "87%", hint: "Trailing 4 cycles", trend: { value: "+4%", direction: "up" } },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((c) => {
          const pct = c.eligible ? Math.round((c.completed / c.eligible) * 100) : 0;
          return (
            <SectionCard key={c.id} title={c.name} action={<StatusBadge tone={tone[c.status]}>{c.status.replace("_", " ")}</StatusBadge>}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[11px] uppercase text-muted-foreground">Period</p>
                    <p>{c.periodStart} – {c.periodEnd}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase text-muted-foreground">Review window</p>
                    <p>{c.reviewWindow}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase text-muted-foreground">Template</p>
                    <p>{c.template}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase text-muted-foreground">Eligible</p>
                    <p>{c.eligible.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completion · {c.completed}/{c.eligible}</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
                <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm">Manage</Button>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
