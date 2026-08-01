import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { workforceService, type SuccessionCandidate } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/workforce/succession")({
  head: () => ({
    meta: [
      { title: "Succession Planning · HireChamps" },
      { name: "description", content: "Key roles and their successors — with readiness horizons and risk assessment." },
      { property: "og:title", content: "Succession Planning · HireChamps" },
    ],
  }),
  component: SuccessionPage,
});

const riskTone: Record<SuccessionCandidate["risk"], StatusTone> = {
  low: "success", medium: "warning", high: "destructive",
};

function SuccessionPage() {
  const [list, setList] = useState<SuccessionCandidate[]>([]);
  useEffect(() => { workforceService.succession().then(setList); }, []);

  const highRisk = list.filter((s) => s.risk === "high").length;
  const coverage = list.filter((s) => s.readyNow.length > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Succession Planning"
        description="Critical roles and identified successors — with readiness and coverage gaps."
        breadcrumbs={[{ label: "HR" }, { label: "Workforce" }, { label: "Succession" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Star, label: "Key roles", value: list.length, hint: "Under plan" },
          { icon: CheckCircle2, label: "Ready-now coverage", value: `${coverage}/${list.length}`, hint: "Roles with successor" },
          { icon: AlertTriangle, label: "High risk", value: highRisk, hint: "No ready successor" },
          { icon: Star, label: "In pipeline", value: list.reduce((s, r) => s + r.readyNow.length + r.ready1yr.length + r.ready2yr.length, 0), hint: "Total successors" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((s, i) => (
          <SectionCard key={i} title={s.role} action={<StatusBadge tone={riskTone[s.risk]}>{s.risk} risk</StatusBadge>}>
            <p className="mb-3 text-xs text-muted-foreground">Incumbent · <span className="font-medium text-foreground">{s.incumbent}</span></p>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-success">Ready now</p>
                {s.readyNow.length ? <div className="flex flex-wrap gap-1.5">{s.readyNow.map((n) => <StatusBadge key={n} tone="success">{n}</StatusBadge>)}</div> : <p className="text-xs text-muted-foreground italic">No successor identified</p>}
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-info">Ready 1yr</p>
                {s.ready1yr.length ? <div className="flex flex-wrap gap-1.5">{s.ready1yr.map((n) => <StatusBadge key={n} tone="info">{n}</StatusBadge>)}</div> : <p className="text-xs text-muted-foreground italic">—</p>}
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ready 2yr+</p>
                {s.ready2yr.length ? <div className="flex flex-wrap gap-1.5">{s.ready2yr.map((n) => <StatusBadge key={n} tone="muted">{n}</StatusBadge>)}</div> : <p className="text-xs text-muted-foreground italic">—</p>}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
