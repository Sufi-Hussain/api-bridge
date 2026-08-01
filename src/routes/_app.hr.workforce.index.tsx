import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Users, TrendingUp, UserPlus, UserMinus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { workforceService } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/workforce/")({
  head: () => ({
    meta: [
      { title: "Workforce Planning · HireChamps" },
      { name: "description", content: "Headcount trend, actual vs target and workforce plan tracking." },
      { property: "og:title", content: "Workforce Planning · HireChamps" },
    ],
  }),
  component: WorkforcePage,
});

function WorkforcePage() {
  const [trend, setTrend] = useState<{ month: string; active: number; target: number }[]>([]);
  useEffect(() => { workforceService.headcountTrend().then(setTrend); }, []);

  const latest = trend[trend.length - 1];
  const gap = latest ? latest.target - latest.active : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Planning"
        description="Headcount growth against plan — with quarterly forecast and hiring gap."
        breadcrumbs={[{ label: "HR" }, { label: "Workforce" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Users, label: "Current", value: latest?.active.toLocaleString() ?? "—", hint: "Active headcount" },
          { icon: TrendingUp, label: "Target", value: latest?.target.toLocaleString() ?? "—", hint: "Plan for month" },
          { icon: UserPlus, label: "Gap to plan", value: gap, hint: "Hire to close" },
          { icon: UserMinus, label: "Q4 forecast", value: "1,215", hint: "Ending headcount" },
        ]}
      />

      <SectionCard title="Actual vs plan">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 8, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={["dataMin - 30", "dataMax + 30"]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="active" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} name="Actual" />
              <Line type="monotone" dataKey="target" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Plan" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}
