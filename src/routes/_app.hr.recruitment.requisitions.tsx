import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Plus, TrendingUp, Clock, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { FilterToolbar } from "@/components/hr/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { recruitmentService, type Requisition } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/recruitment/requisitions")({
  head: () => ({
    meta: [
      { title: "Job Requisitions · HireChamps" },
      { name: "description", content: "Track and approve every job requisition — with budget, priority and hiring manager." },
      { property: "og:title", content: "Job Requisitions · HireChamps" },
    ],
  }),
  component: RequisitionsPage,
});

const statusTone: Record<Requisition["status"], StatusTone> = {
  draft: "muted", pending_approval: "warning", approved: "success", on_hold: "warning", closed: "muted",
};
const priorityTone: Record<Requisition["priority"], StatusTone> = {
  low: "muted", medium: "info", high: "warning", critical: "destructive",
};

function RequisitionsPage() {
  const [list, setList] = useState<Requisition[]>([]);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  useEffect(() => { recruitmentService.requisitions().then(setList); }, []);

  const filtered = useMemo(() => list.filter((r) =>
    (status === "all" || r.status === status) && (priority === "all" || r.priority === priority),
  ), [list, status, priority]);

  const totals = useMemo(() => ({
    open: list.filter((r) => r.status === "approved").length,
    pending: list.filter((r) => r.status === "pending_approval").length,
    critical: list.filter((r) => r.priority === "critical").length,
    budget: list.reduce((s, r) => s + r.budget, 0),
  }), [list]);

  const columns: ColumnDef<Requisition>[] = [
    {
      header: "Role",
      accessorKey: "title",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.department} · {row.original.location}</p>
        </div>
      ),
    },
    { header: "Openings", cell: ({ row }) => (
      <div>
        <div className="flex items-center gap-2 text-xs">
          <span>{row.original.filled} / {row.original.openings}</span>
        </div>
        <Progress value={(row.original.filled / row.original.openings) * 100} className="mt-1 h-1 w-20" />
      </div>
    ) },
    { header: "Hiring manager", accessorKey: "hiringManager", cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span> },
    { header: "Priority", cell: ({ row }) => <StatusBadge tone={priorityTone[row.original.priority]}>{row.original.priority}</StatusBadge> },
    { header: "Status", cell: ({ row }) => <StatusBadge tone={statusTone[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge> },
    { header: "Budget", accessorKey: "budget", cell: ({ getValue }) => <span className="text-sm">${Number(getValue()).toLocaleString()}</span> },
    { header: "Target start", accessorKey: "targetStart" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Requisitions"
        description="Track hiring demand across the organization — from draft to approved and closed."
        breadcrumbs={[{ label: "HR" }, { label: "Recruitment" }, { label: "Requisitions" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New requisition</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Briefcase, label: "Open", value: totals.open, hint: "Approved & active" },
          { icon: Clock, label: "Pending approval", value: totals.pending, hint: "Awaiting review" },
          { icon: TrendingUp, label: "Critical priority", value: totals.critical, hint: "Urgent hires" },
          { icon: DollarSign, label: "Budget requested", value: `$${(totals.budget / 1000).toFixed(0)}k`, hint: "Aggregate" },
        ]}
      />

      <FilterToolbar
        filters={[
          { id: "status", label: "Status", value: status, onChange: setStatus, options: Object.keys(statusTone).map((s) => ({ value: s, label: s.replace("_", " ") })) },
          { id: "priority", label: "Priority", value: priority, onChange: setPriority, options: ["low","medium","high","critical"].map((p) => ({ value: p, label: p })) },
        ]}
      />

      <SectionCard title={`${filtered.length} requisitions`}>
        <DataTable columns={columns} data={filtered} searchPlaceholder="Search role, department…" pageSize={10} />
      </SectionCard>
    </div>
  );
}
