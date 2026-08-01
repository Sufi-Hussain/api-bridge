import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserMinus, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { lifecycleService, type Resignation } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/offboarding/resignations")({
  head: () => ({
    meta: [
      { title: "Resignations · HireChamps" },
      { name: "description", content: "Track resignations from submission through clearance, exit interview and final settlement." },
      { property: "og:title", content: "Resignations · HireChamps" },
    ],
  }),
  component: ResignationsPage,
});

const statusTone: Record<Resignation["status"], StatusTone> = {
  submitted: "info", manager_review: "warning", hr_review: "warning",
  approved: "success", rejected: "destructive", revoked: "muted",
};

function ResignationsPage() {
  const [list, setList] = useState<Resignation[]>([]);
  useEffect(() => { lifecycleService.resignations().then(setList); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resignations"
        description="Manage separation lifecycle — notices, clearances, exit interviews, settlements."
        breadcrumbs={[{ label: "HR" }, { label: "Offboarding" }, { label: "Resignations" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: UserMinus, label: "Active", value: list.length, hint: "In progress" },
          { icon: Clock, label: "Pending review", value: list.filter((r) => r.status.includes("review")).length, hint: "Manager/HR" },
          { icon: CheckCircle2, label: "Cleared", value: list.filter((r) => r.clearanceProgress >= 90).length, hint: "Ready to close" },
          { icon: MessageCircle, label: "Exit interviews", value: list.filter((r) => r.exitInterviewDone).length, hint: "Completed" },
        ]}
      />

      <SectionCard title="Ongoing separations">
        <ul className="divide-y divide-border/60">
          {list.map((r) => (
            <li key={r.id} className="grid gap-3 py-3 md:grid-cols-[auto_1fr_auto] md:items-center">
              <PersonAvatar name={r.employeeName} className="h-10 w-10" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{r.employeeName}</span>
                  <StatusBadge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</StatusBadge>
                  {r.exitInterviewDone && <StatusBadge tone="success">Exit interview done</StatusBadge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.role} · {r.department} · Manager: {r.manager}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Submitted {r.submittedAt} · LWD {r.lastWorkingDay} · Reason: {r.reason}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${r.clearanceProgress}%` }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">Clearance {r.clearanceProgress}%</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline">Checklist</Button>
                <Button size="sm">Advance</Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
