import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { performanceService, type Competency } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/performance/competencies")({
  head: () => ({
    meta: [
      { title: "Competencies · HireChamps" },
      { name: "description", content: "Framework of competencies used across reviews, hiring and development." },
      { property: "og:title", content: "Competencies · HireChamps" },
    ],
  }),
  component: CompetenciesPage,
});

const catTone = { leadership: "info", functional: "success", behavioral: "warning", technical: "muted" } as const;

function CompetenciesPage() {
  const [list, setList] = useState<Competency[]>([]);
  useEffect(() => { performanceService.competencies().then(setList); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competency Framework"
        description="Behavioral, functional, leadership and technical competencies used across the org."
        breadcrumbs={[{ label: "HR" }, { label: "Performance" }, { label: "Competencies" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Add competency</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <SectionCard key={c.id} title={c.name} action={<StatusBadge tone={catTone[c.category]}>{c.category}</StatusBadge>}>
            <p className="text-sm text-muted-foreground">{c.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">Levels</p>
                <p className="font-semibold">1 → {c.levels}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">Applies to</p>
                <p className="font-semibold">{c.applies.join(", ")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: c.levels }).map((_, i) => (
                <div key={i} className="h-2 flex-1 rounded-full bg-primary/20">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${((i + 1) / c.levels) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3 w-3" /> Included in Q4 · 2026 template
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
