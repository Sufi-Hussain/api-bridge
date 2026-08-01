import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Line, LineChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Clock, Target, TrendingUp, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { recruitmentService } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/recruitment/analytics")({
  head: () => ({
    meta: [
      { title: "Hiring Analytics · HireChamps" },
      { name: "description", content: "Recruitment funnel, time-to-hire, source mix and quarterly hiring performance." },
      { property: "og:title", content: "Hiring Analytics · HireChamps" },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)"];

function AnalyticsPage() {
  const [funnel, setFunnel] = useState<{ stage: string; count: number }[]>([]);
  const [trend, setTrend] = useState<{ month: string; opened: number; closed: number; tth: number }[]>([]);
  const [sources, setSources] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    recruitmentService.funnel().then(setFunnel);
    recruitmentService.hiringTrend().then(setTrend);
    recruitmentService.sourceMix().then(setSources);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring Analytics"
        description="Funnel conversion, time-to-hire, source effectiveness — the numbers behind your recruitment."
        breadcrumbs={[{ label: "HR" }, { label: "Recruitment" }, { label: "Analytics" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Target, label: "Offers/Interview", value: "35%", hint: "Conversion", trend: { value: "+3%", direction: "up" } },
          { icon: Clock, label: "Avg time-to-hire", value: "32 days", hint: "Nov 2026", trend: { value: "-5d", direction: "up" } },
          { icon: TrendingUp, label: "Hired this Q", value: "34", hint: "vs 28 last Q", trend: { value: "+21%", direction: "up" } },
          { icon: DollarSign, label: "Cost per hire", value: "$4,280", hint: "Below target", trend: { value: "-8%", direction: "up" } },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recruitment funnel">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stage" width={80} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Time to hire · trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="tth" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} name="Days to hire" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Opened vs Closed">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="opened" fill="var(--chart-2)" radius={[4,4,0,0]} name="Opened" />
                <Bar dataKey="closed" fill="var(--chart-3)" radius={[4,4,0,0]} name="Closed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Source mix">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Pie data={sources} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            {sources.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 text-muted-foreground">{s.name}</span>
                <span className="font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
