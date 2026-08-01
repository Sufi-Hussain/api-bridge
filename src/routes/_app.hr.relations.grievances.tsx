import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flag, ShieldAlert, Clock, CheckCircle2, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Button } from "@/components/ui/button";
import { relationsService, type Grievance } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/relations/grievances")({
  head: () => ({
    meta: [
      { title: "Grievances · HireChamps" },
      { name: "description", content: "Confidential grievance reporting and investigation tracking." },
      { property: "og:title", content: "Grievances · HireChamps" },
    ],
  }),
  component: GrievancesPage,
});

const sevTone: Record<Grievance["severity"], StatusTone> = {
  low: "muted", medium: "info", high: "warning", critical: "destructive",
};
const statusTone: Record<Grievance["status"], StatusTone> = {
  open: "info", investigating: "warning", resolved: "success", escalated: "destructive", closed: "muted",
};

function GrievancesPage() {
  const [list, setList] = useState<Grievance[]>([]);
  useEffect(() => { relationsService.grievances().then(setList); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grievances"
        description="Handle sensitive employee concerns with confidentiality, investigation and resolution."
        breadcrumbs={[{ label: "HR" }, { label: "Relations" }, { label: "Grievances" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Log case</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Flag, label: "Open cases", value: list.filter((g) => g.status !== "closed" && g.status !== "resolved").length, hint: "Under handling" },
          { icon: ShieldAlert, label: "Critical/High", value: list.filter((g) => g.severity === "critical" || g.severity === "high").length, hint: "Escalation path" },
          { icon: Clock, label: "Avg TAT", value: "12d", hint: "Investigation → resolution", trend: { value: "-2d", direction: "up" } },
          { icon: CheckCircle2, label: "Resolved YTD", value: 42, hint: "Cases closed" },
        ]}
      />

      <SectionCard title={`${list.length} cases`}>
        <ul className="divide-y divide-border/60">
          {list.map((g) => (
            <li key={g.id} className="grid gap-3 py-3 md:grid-cols-[auto_1fr_auto] md:items-start">
              <PersonAvatar name={g.reportedBy} className="h-10 w-10" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{g.anonymous ? "Anonymous" : g.reportedBy}</span>
                  <StatusBadge tone={sevTone[g.severity]}>{g.severity}</StatusBadge>
                  <StatusBadge tone={statusTone[g.status]}>{g.status}</StatusBadge>
                  <StatusBadge tone="muted">{g.category}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{g.summary}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Submitted {g.submittedAt} · Assigned: {g.assignedTo}</p>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline">Notes</Button>
                <Button size="sm">Open case</Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
