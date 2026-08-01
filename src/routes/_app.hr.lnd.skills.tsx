import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layers, Zap } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { learningService, type SkillMatrixRow } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/lnd/skills")({
  head: () => ({
    meta: [
      { title: "Skill Matrix · HireChamps" },
      { name: "description", content: "Enterprise view of skill depth and gaps across technical, functional and behavioral areas." },
      { property: "og:title", content: "Skill Matrix · HireChamps" },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const [rows, setRows] = useState<SkillMatrixRow[]>([]);
  useEffect(() => { learningService.skillMatrix().then(setRows); }, []);

  const totalGap = rows.reduce((s, r) => s + r.gap, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Matrix"
        description="Distribution of skills at beginner, intermediate, advanced and expert levels — with gap analysis."
        breadcrumbs={[{ label: "HR" }, { label: "L&D" }, { label: "Skills" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Layers, label: "Skills tracked", value: rows.length, hint: "Core & specialty" },
          { icon: Zap, label: "Total gap", value: totalGap, hint: "Skill deficit units" },
          { icon: Layers, label: "Experts", value: rows.reduce((s, r) => s + r.expert, 0), hint: "Across skills" },
          { icon: Layers, label: "Coverage", value: "84%", hint: "Skills with 2+ experts", trend: { value: "+3%", direction: "up" } },
        ]}
      />

      <SectionCard title="Skill distribution">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 text-left font-semibold">Skill</th>
                <th className="py-2 text-left font-semibold">Category</th>
                <th className="py-2 text-center font-semibold">Beginner</th>
                <th className="py-2 text-center font-semibold">Intermediate</th>
                <th className="py-2 text-center font-semibold">Advanced</th>
                <th className="py-2 text-center font-semibold">Expert</th>
                <th className="py-2 text-right font-semibold">Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => {
                const total = r.beginner + r.intermediate + r.advanced + r.expert;
                return (
                  <tr key={r.skill}>
                    <td className="py-2 font-medium">{r.skill}</td>
                    <td className="py-2 text-muted-foreground">{r.category}</td>
                    {[r.beginner, r.intermediate, r.advanced, r.expert].map((v, i) => {
                      const pct = Math.round((v / total) * 100);
                      const colors = ["bg-chart-4/60", "bg-chart-3/60", "bg-chart-2/60", "bg-chart-1/60"];
                      return (
                        <td key={i} className="py-2 text-center">
                          <div className="mx-auto flex w-20 flex-col items-center">
                            <span>{v}</span>
                            <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                              <div className={"h-full " + colors[i]} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className={"py-2 text-right font-semibold " + (r.gap > 25 ? "text-destructive" : r.gap > 12 ? "text-warning-foreground" : "text-success")}>
                      {r.gap}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
