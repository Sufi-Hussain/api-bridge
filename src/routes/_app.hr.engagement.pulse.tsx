import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { BarChart as BarIcon, Users, TrendingUp, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { engagementService, type PulseSurvey } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/engagement/pulse")({
  head: () => ({
    meta: [
      { title: "Pulse Surveys · HireChamps" },
      { name: "description", content: "Track engagement, manager effectiveness, onboarding and exit sentiment." },
      { property: "og:title", content: "Pulse Surveys · HireChamps" },
    ],
  }),
  component: PulsePage,
});

function PulsePage() {
  const [list, setList] = useState<PulseSurvey[]>([]);
  const [trend, setTrend] = useState<{ month: string; eNps: number }[]>([]);
  useEffect(() => {
    engagementService.pulseSurveys().then(setList);
    engagementService.engagementTrend().then(setTrend);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pulse Surveys"
        description="Continuous listening — engagement, manager, onboarding and exit sentiment."
        breadcrumbs={[{ label: "HR" }, { label: "Engagement" }, { label: "Pulse" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Launch survey</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: BarIcon, label: "Active surveys", value: list.filter((s) => s.status === "running").length, hint: "Collecting data" },
          { icon: Users, label: "Latest eNPS", value: trend[trend.length - 1]?.eNps ?? "—", hint: "Nov 2026", trend: { value: "+4", direction: "up" } },
          { icon: TrendingUp, label: "Response rate", value: "82%", hint: "Rolling avg" },
          { icon: BarIcon, label: "Total responses", value: list.reduce((s, x) => s + x.responded, 0).toLocaleString(), hint: "YTD" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="eNPS trend" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="eNps" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Active surveys">
          <ul className="space-y-3">
            {list.map((s) => {
              const pct = Math.round((s.responded / s.sent) * 100);
              return (
                <li key={s.id} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.cycle} · launched {s.launchedAt}</p>
                    </div>
                    <StatusBadge tone={s.status === "running" ? "info" : "muted"}>{s.status}</StatusBadge>
                  </div>
                  <div className="mt-2">
                    <div className="mb-0.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{s.responded}/{s.sent}</span>
                      <span className="font-semibold">{pct}% · eNPS {s.eNps}</span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
