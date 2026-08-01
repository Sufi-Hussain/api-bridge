import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";
import { TrendingDown, Users, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { workforceService } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/workforce/attrition")({
  head: () => ({
    meta: [
      { title: "Attrition Analysis · HireChamps" },
      { name: "description", content: "Voluntary and involuntary attrition trends with root-cause breakdown." },
      { property: "og:title", content: "Attrition · HireChamps" },
    ],
  }),
  component: AttritionPage,
});

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)","var(--chart-1)"];

function AttritionPage() {
  const [trend, setTrend] = useState<{ month: string; voluntary: number; involuntary: number }[]>([]);
  const [reasons, setReasons] = useState<{ reason: string; value: number }[]>([]);
  useEffect(() => {
    workforceService.attritionTrend().then(setTrend);
    workforceService.attritionByReason().then(setReasons);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attrition Analysis"
        description="Voluntary and involuntary attrition — with reasons and departmental hot spots."
        breadcrumbs={[{ label: "HR" }, { label: "Workforce" }, { label: "Attrition" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: TrendingDown, label: "Attrition YTD", value: "8.4%", hint: "Below industry (11.2%)", trend: { value: "-0.6", direction: "up" } },
          { icon: Users, label: "Exits · Nov", value: "23", hint: "vs 26 last month" },
          { icon: AlertTriangle, label: "Regretted", value: "38%", hint: "Of total exits" },
          { icon: TrendingDown, label: "Avg tenure at exit", value: "3.4y", hint: "Rolling 12mo" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Attrition trend · %">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="voluntary" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="involuntary" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Top reasons for exit">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reasons} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="reason" width={100} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {reasons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
