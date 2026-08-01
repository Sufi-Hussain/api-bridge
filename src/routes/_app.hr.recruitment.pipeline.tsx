import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserPlus, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { CandidateCard } from "@/components/hr/candidate-card";
import { Button } from "@/components/ui/button";
import { recruitmentService, type Candidate, type CandidateStage } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/recruitment/pipeline")({
  head: () => ({
    meta: [
      { title: "Candidate Pipeline · HireChamps" },
      { name: "description", content: "Kanban view of every candidate — sourced, screened, interviewed, offered, hired." },
      { property: "og:title", content: "Candidate Pipeline · HireChamps" },
    ],
  }),
  component: PipelinePage,
});

const STAGES: { id: CandidateStage; label: string; accent: string }[] = [
  { id: "sourced", label: "Sourced", accent: "bg-muted-foreground" },
  { id: "screen", label: "Screening", accent: "bg-chart-2" },
  { id: "interview", label: "Interview", accent: "bg-chart-1" },
  { id: "assessment", label: "Assessment", accent: "bg-warning" },
  { id: "offer", label: "Offer", accent: "bg-chart-3" },
  { id: "hired", label: "Hired", accent: "bg-success" },
];

function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  useEffect(() => { recruitmentService.candidates().then(setCandidates); }, []);

  const byStage = STAGES.map((s) => ({ ...s, cards: candidates.filter((c) => c.stage === s.id) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Pipeline"
        description="Every candidate at every stage — drag between columns to advance."
        breadcrumbs={[{ label: "HR" }, { label: "Recruitment" }, { label: "Pipeline" }]}
        actions={
          <>
            <Button size="sm" variant="outline"><Filter className="mr-1.5 h-3.5 w-3.5" /> Filter</Button>
            <Button size="sm"><UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add candidate</Button>
          </>
        }
      />

      <MetricsGrid
        columns={6}
        metrics={STAGES.map((s) => ({
          label: s.label,
          value: candidates.filter((c) => c.stage === s.id).length,
          hint: `${candidates.filter((c) => c.stage === s.id).length} candidates`,
        }))}
      />

      <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {byStage.map((col) => (
          <div key={col.id} className="flex flex-col rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={"h-2 w-2 rounded-full " + col.accent} />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{col.cards.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.cards.length === 0 ? (
                <p className="rounded-md border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">Empty</p>
              ) : col.cards.slice(0, 5).map((c) => <CandidateCard key={c.id} candidate={c} />)}
              {col.cards.length > 5 && (
                <button className="rounded-md border border-dashed border-border/60 p-2 text-xs text-muted-foreground hover:bg-accent/40">
                  + {col.cards.length - 5} more
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Aging in pipeline">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "< 7 days", value: 42, tone: "text-success" },
            { label: "7–14 days", value: 26, tone: "text-info" },
            { label: "14–30 days", value: 14, tone: "text-warning-foreground" },
            { label: "30+ days", value: 8, tone: "text-destructive" },
          ].map((b) => (
            <div key={b.label} className="rounded-lg border border-border/60 p-4">
              <p className="text-xs text-muted-foreground">{b.label}</p>
              <p className={"mt-1 text-2xl font-semibold " + b.tone}>{b.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">candidates</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
