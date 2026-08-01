import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, Award, TrendingUp, ArrowRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { learningService, type TrainingProgram } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/lnd/")({
  head: () => ({
    meta: [
      { title: "Learning Dashboard · HireChamps" },
      { name: "description", content: "Enterprise learning — programs, completion, mandatory training and certification health." },
      { property: "og:title", content: "Learning Dashboard · HireChamps" },
    ],
  }),
  component: LndDashboard,
});

function LndDashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof learningService.stats>> | null>(null);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  useEffect(() => {
    learningService.stats().then(setStats);
    learningService.programs().then(setPrograms);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning & Development"
        description="Programs, learners, mandatory compliance and certification health at a glance."
        breadcrumbs={[{ label: "HR" }, { label: "L&D" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: BookOpen, label: "Programs", value: stats?.totalPrograms ?? "—", hint: "Active catalog" },
          { icon: GraduationCap, label: "Active learners", value: stats?.activeLearners ?? "—", hint: "This month" },
          { icon: TrendingUp, label: "Completion rate", value: `${stats?.completionRate ?? 0}%`, hint: "Rolling 30d", trend: { value: "+4%", direction: "up" } },
          { icon: Award, label: "Certs expiring", value: stats?.certsExpiring ?? "—", hint: "Next 60 days" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Learning hours · trend" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.trend ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="hrs" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Compliance">
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Mandatory · GDPR</span><span className="font-semibold">88%</span>
              </div>
              <Progress value={88} className="h-1.5" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>POSH training</span><span className="font-semibold">97%</span>
              </div>
              <Progress value={97} className="h-1.5" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Manager onboarding</span><span className="font-semibold">74%</span>
              </div>
              <Progress value={74} className="h-1.5" />
            </div>
            <div className="rounded-md bg-warning/10 p-2 text-xs">
              <span className="font-medium text-warning-foreground">42 employees</span> have overdue mandatory training.
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top programs" action={<Button asChild size="sm" variant="ghost" className="text-xs"><Link to="/hr/lnd/programs">All programs <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>}>
        <ul className="divide-y divide-border/60">
          {programs.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.mandatory && <StatusBadge tone="warning">Mandatory</StatusBadge>}
                </div>
                <p className="text-xs text-muted-foreground">{p.category} · {p.format} · {p.durationHrs}h</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold">{Math.round((p.completed / p.enrolled) * 100)}%</p>
                <p className="text-muted-foreground">{p.completed}/{p.enrolled}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
