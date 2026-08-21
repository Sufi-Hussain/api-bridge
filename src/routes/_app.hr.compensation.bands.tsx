import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeDollarSign, Users, Layers } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { compensationApiService as compensationService, type SalaryBand } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/compensation/bands")({
  head: () => ({
    meta: [
      { title: "Salary Bands · HireChamps" },
      { name: "description", content: "Grade-based compensation ranges with min, mid, max and current averages." },
      { property: "og:title", content: "Salary Bands · HireChamps" },
    ],
  }),
  component: BandsPage,
});

function BandsPage() {
  const [list, setList] = useState<SalaryBand[]>([]);
  useEffect(() => { compensationService.bands().then(setList); }, []);

  const totalHc = list.reduce((s, b) => s + b.headcount, 0);
  const maxBand = Math.max(...list.map((b) => b.maxUsd), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Bands"
        description="Grade structure and salary ranges — with headcount and current averages against the band."
        breadcrumbs={[{ label: "HR" }, { label: "Compensation" }, { label: "Bands" }]}
      />

      <MetricsGrid
        columns={3}
        metrics={[
          { icon: Layers, label: "Grades", value: list.length, hint: "Active bands" },
          { icon: Users, label: "Employees", value: totalHc, hint: "Across bands" },
          { icon: BadgeDollarSign, label: "Avg base", value: `$${Math.round(list.reduce((s,b) => s + b.currentAvgUsd, 0) / (list.length || 1)).toLocaleString()}`, hint: "USD equivalent" },
        ]}
      />

      <SectionCard title="Band visualization">
        <div className="space-y-3">
          {list.map((b) => {
            const l = (b.minUsd / maxBand) * 100;
            const w = ((b.maxUsd - b.minUsd) / maxBand) * 100;
            const curPos = ((b.currentAvgUsd - b.minUsd) / (b.maxUsd - b.minUsd)) * 100;
            return (
              <div key={b.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold">{b.grade}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{b.role} · {b.department} · {b.headcount} people</span>
                  </div>
                  <span className="text-xs text-muted-foreground">${b.minUsd.toLocaleString()} – ${b.maxUsd.toLocaleString()}</span>
                </div>
                <div className="relative h-6 rounded-md bg-muted/40">
                  <div className="absolute top-0 h-full rounded-md bg-primary/20" style={{ left: `${l}%`, width: `${w}%` }}>
                    <div className="absolute top-0 h-full w-0.5 bg-primary/50" style={{ left: `${((b.midUsd - b.minUsd) / (b.maxUsd - b.minUsd)) * 100}%` }} />
                    <div className="absolute -top-1 h-8 w-1 rounded-full bg-primary" style={{ left: `${curPos}%`, transform: "translateX(-50%)" }} title={`Current avg: $${b.currentAvgUsd.toLocaleString()}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
