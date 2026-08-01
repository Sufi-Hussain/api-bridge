import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Line, LineChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Users, Globe, TrendingUp, Award } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { analyticsService } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/analytics/diversity")({
  head: () => ({
    meta: [
      { title: "Diversity Analytics · HireChamps" },
      { name: "description", content: "Gender, age, nationality and leadership representation metrics." },
      { property: "og:title", content: "Diversity Analytics · HireChamps" },
    ],
  }),
  component: DiversityPage,
});

const COLORS = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)"];

function DiversityPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof analyticsService.diversity>> | null>(null);
  useEffect(() => { analyticsService.diversity().then(setData); }, []);

  const womenLatest = data?.trend[data.trend.length - 1]?.women ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diversity Analytics"
        description="Enterprise view of representation across gender, age, nationality and leadership."
        breadcrumbs={[{ label: "HR" }, { label: "Analytics" }, { label: "Diversity" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Users, label: "Women", value: `${womenLatest}%`, hint: "Total workforce", trend: { value: "+2%", direction: "up" } },
          { icon: Award, label: "Women in leadership", value: `${data?.leadership.find((l) => l.name.includes("Women"))?.value ?? 0}%`, hint: "Manager+" },
          { icon: Globe, label: "Nationalities", value: data?.nationalities ?? "—", hint: "Represented" },
          { icon: TrendingUp, label: "Diversity index", value: "0.72", hint: "Blau's index", trend: { value: "+0.03", direction: "up" } },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Gender mix">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Pie data={data?.genderMix ?? []} dataKey="value" nameKey="name" outerRadius={90} label={{ fontSize: 11 }}>
                  {(data?.genderMix ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Age distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ageGroups ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {(data?.ageGroups ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Women representation · trend" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trend ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="women" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
