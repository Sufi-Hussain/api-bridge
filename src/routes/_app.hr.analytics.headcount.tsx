import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, Line, LineChart, Cell, Pie, PieChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Users, UserPlus, UserMinus, Repeat } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { analyticsService } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/analytics/headcount")({
  head: () => ({
    meta: [
      { title: "Headcount Analytics · HireChamps" },
      { name: "description", content: "Deep-dive into headcount trends, distribution by department, band, tenure and location." },
      { property: "og:title", content: "Headcount Analytics · HireChamps" },
    ],
  }),
  component: HeadcountAnalytics,
});

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)"];

function HeadcountAnalytics() {
  const [data, setData] = useState<Awaited<ReturnType<typeof analyticsService.headcount>> | null>(null);
  useEffect(() => { analyticsService.headcount().then(setData); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Headcount Analytics"
        description="Every angle on your workforce — trend, distribution, tenure, movement."
        breadcrumbs={[{ label: "HR" }, { label: "Analytics" }, { label: "Headcount" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Users, label: "Total headcount", value: data?.total.toLocaleString() ?? "—", hint: "Active employees", trend: { value: "+2.1%", direction: "up" } },
          { icon: UserPlus, label: "New hires QTD", value: data?.newHiresQtd ?? "—", hint: "Joined this quarter" },
          { icon: UserMinus, label: "Exits QTD", value: data?.exitsQtd ?? "—", hint: "Voluntary + involuntary" },
          { icon: Repeat, label: "Internal moves", value: data?.internalMoves ?? "—", hint: "Promotions & transfers" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trend ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["dataMin - 30", "dataMax + 30"]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="By department">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byDept ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="By tenure">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.tenure ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {(data?.tenure ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="By band">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Pie data={data?.byBand ?? []} dataKey="value" nameKey="name" outerRadius={90} label={{ fontSize: 10 }}>
                  {(data?.byBand ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
