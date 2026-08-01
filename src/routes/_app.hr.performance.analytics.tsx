import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Legend } from "recharts";
import { Trophy, Target, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { performanceService } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/performance/analytics")({
  head: () => ({
    meta: [
      { title: "Performance Analytics · HireChamps" },
      { name: "description", content: "Rating distribution, cycle progress and goal health across the organization." },
      { property: "og:title", content: "Performance Analytics · HireChamps" },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)"];

function AnalyticsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof performanceService.analytics>> | null>(null);
  useEffect(() => { performanceService.analytics().then(setData); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        description="Enterprise view of ratings, cycle progress and goal health."
        breadcrumbs={[{ label: "HR" }, { label: "Performance" }, { label: "Analytics" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Trophy, label: "Top performers", value: "84", hint: "Rating 5", trend: { value: "+12%", direction: "up" } },
          { icon: Target, label: "Goal completion", value: "72%", hint: "Q4 cycle", trend: { value: "+6%", direction: "up" } },
          { icon: ClipboardCheck, label: "Review completion", value: "63%", hint: "In-cycle" },
          { icon: Trophy, label: "Avg rating", value: "3.4", hint: "Company-wide" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Rating distribution">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ratingDistribution ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {(data?.ratingDistribution ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Goal health">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Pie data={data?.goalHealth ?? []} dataKey="value" nameKey="status" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {(data?.goalHealth ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Cycle progress" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.cycleProgress ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="done" stackId="a" fill="var(--chart-1)" radius={[0,0,0,0]} name="Completed" />
                <Bar dataKey="remaining" stackId="a" fill="var(--chart-4)" radius={[4,4,0,0]} name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
