import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserCheck, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { lifecycleService, type OnboardingHire } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/onboarding/")({
  head: () => ({
    meta: [
      { title: "New Hire Dashboard · HireChamps" },
      { name: "description", content: "Track every new hire through preboarding, orientation and first-week milestones." },
      { property: "og:title", content: "Onboarding · HireChamps" },
    ],
  }),
  component: OnboardingDashboard,
});

const statusTone: Record<OnboardingHire["status"], StatusTone> = {
  preboarding: "info", in_progress: "warning", completed: "success", delayed: "destructive",
};

function OnboardingDashboard() {
  const [hires, setHires] = useState<OnboardingHire[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof lifecycleService.onboardingStats>> | null>(null);
  useEffect(() => {
    lifecycleService.hires().then(setHires);
    lifecycleService.onboardingStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Hire Dashboard"
        description="Every joiner in the pipeline — preboarding, day-one, first-week and probation."
        breadcrumbs={[{ label: "HR" }, { label: "Onboarding" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Add hire</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: UserCheck, label: "New hires", value: stats?.newHires ?? "—", hint: "This month" },
          { icon: Clock, label: "In progress", value: stats?.inProgress ?? "—", hint: "Active onboarding" },
          { icon: CheckCircle2, label: "Avg progress", value: `${stats?.avgProgress ?? 0}%`, hint: "Across cohort" },
          { icon: AlertCircle, label: "Delayed", value: stats?.delayed ?? "—", hint: "Need attention", trend: { value: "SLA at risk", direction: "flat" } },
        ]}
      />

      <SectionCard title={`New hires · ${hires.length} in cohort`}>
        <div className="grid gap-3 md:grid-cols-2">
          {hires.map((h) => (
            <div key={h.id} className="rounded-lg border border-border/60 bg-card p-4">
              <div className="flex items-start gap-3">
                <PersonAvatar name={h.candidateName} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{h.candidateName}</p>
                    <StatusBadge tone={statusTone[h.status]}>{h.status.replace("_", " ")}</StatusBadge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{h.role} · {h.department}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Join: {h.joinDate} · Buddy: {h.buddy} · Manager: {h.manager}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tasks · {h.tasksDone} / {h.tasksTotal}</span>
                  <span className="font-semibold">{h.progress}%</span>
                </div>
                <Progress value={h.progress} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
