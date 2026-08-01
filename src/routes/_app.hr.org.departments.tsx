import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building, Users, Briefcase, DollarSign, TrendingUp, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Button } from "@/components/ui/button";
import { departmentService, type Department } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/org/departments")({
  head: () => ({
    meta: [
      { title: "Departments · HireChamps" },
      { name: "description", content: "Manage departments, heads, headcount, budgets and attrition." },
      { property: "og:title", content: "Departments · HireChamps" },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const [list, setList] = useState<Department[]>([]);
  useEffect(() => { departmentService.list().then(setList); }, []);

  const totals = list.reduce((s, d) => ({
    hc: s.hc + d.headcount, open: s.open + d.openPositions, budget: s.budget + d.budgetUsd,
  }), { hc: 0, open: 0, budget: 0 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Structure, ownership, budget and headcount for every department."
        breadcrumbs={[{ label: "HR" }, { label: "Organization" }, { label: "Departments" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New department</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Building, label: "Departments", value: list.length, hint: "Active" },
          { icon: Users, label: "Total headcount", value: totals.hc, hint: "Across departments" },
          { icon: Briefcase, label: "Open positions", value: totals.open, hint: "Hiring now" },
          { icon: DollarSign, label: "Total budget", value: `$${(totals.budget / 1_000_000).toFixed(1)}M`, hint: "Annual" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <SectionCard key={d.id} title={d.name} action={<StatusBadge tone="muted">{d.code}</StatusBadge>}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PersonAvatar name={d.headName} className="h-8 w-8" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.headName}</p>
                  <p className="text-xs text-muted-foreground">Department head</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground">Headcount</p>
                  <p className="font-semibold">{d.headcount}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground">Open roles</p>
                  <p className="font-semibold">{d.openPositions}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground">Budget</p>
                  <p className="font-semibold">${(d.budgetUsd / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground">Attrition YTD</p>
                  <p className={"font-semibold " + (d.attritionYtd > 8 ? "text-warning-foreground" : "")}>{d.attritionYtd}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span>{d.costCenter}</span>
                <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Growing</span>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
