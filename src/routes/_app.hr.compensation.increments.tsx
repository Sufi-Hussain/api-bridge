import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { DollarSign, TrendingUp, Users, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Progress } from "@/components/ui/progress";
import { compensationService } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/compensation/increments")({
  head: () => ({
    meta: [
      { title: "Increment Planning · HireChamps" },
      { name: "description", content: "Annual increment cycle — budget, allocation, department breakdown and multi-year trend." },
      { property: "og:title", content: "Increment Planning · HireChamps" },
    ],
  }),
  component: IncrementsPage,
});

function IncrementsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof compensationService.incrementSummary>> | null>(null);
  useEffect(() => { compensationService.incrementSummary().then(setData); }, []);

  const utilisation = data ? Math.round((data.allocatedUsd / data.budgetUsd) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Increment Planning"
        description={data?.cycle ?? "Annual cycle"}
        breadcrumbs={[{ label: "HR" }, { label: "Compensation" }, { label: "Increments" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: DollarSign, label: "Budget", value: `$${((data?.budgetUsd ?? 0) / 1_000_000).toFixed(2)}M`, hint: "Approved pool" },
          { icon: DollarSign, label: "Allocated", value: `$${((data?.allocatedUsd ?? 0) / 1_000_000).toFixed(2)}M`, hint: `${utilisation}% used` },
          { icon: TrendingUp, label: "Avg hike", value: `${data?.avgHikePct ?? 0}%`, hint: "Across eligible" },
          { icon: Users, label: "Top performer", value: `${data?.topPerformerPct ?? 0}%`, hint: "Rating 5 avg hike" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Budget utilisation" className="lg:col-span-1">
          <div className="text-center">
            <p className="text-5xl font-bold">{utilisation}%</p>
            <p className="mt-1 text-sm text-muted-foreground">of budget allocated</p>
          </div>
          <Progress value={utilisation} className="mt-4 h-2" />
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>Allocated ${(data?.allocatedUsd ?? 0).toLocaleString()}</span>
            <span>Budget ${(data?.budgetUsd ?? 0).toLocaleString()}</span>
          </div>
          <div className="mt-4 rounded-md bg-info/10 p-3 text-xs">
            <p className="mb-1 flex items-center gap-1 font-semibold text-info"><Sparkles className="h-3 w-3" /> AI Insight</p>
            <p className="text-muted-foreground">Engineering is 8% over budget while Sales has 12% slack — consider rebalancing before final freeze.</p>
          </div>
        </SectionCard>

        <SectionCard title="Avg hike by department" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byDept ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avg" fill="var(--chart-1)" radius={[4,4,0,0]} name="Avg %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Multi-year trend" className="lg:col-span-3">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trend ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
