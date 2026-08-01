import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Clock, CheckCircle2, Send } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/common/data-table";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { PersonAvatar } from "@/components/common/person-avatar";
import { performanceService, type Review } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/performance/employee-reviews")({
  head: () => ({
    meta: [
      { title: "Employee Reviews · HireChamps" },
      { name: "description", content: "Every review in the current cycle — self, manager and final ratings." },
      { property: "og:title", content: "Employee Reviews · HireChamps" },
    ],
  }),
  component: ReviewsPage,
});

const tone: Record<Review["status"], StatusTone> = {
  not_started: "muted", in_progress: "info", submitted: "warning", calibrated: "warning", shared: "success",
};

function ReviewsPage() {
  const [list, setList] = useState<Review[]>([]);
  useEffect(() => { performanceService.reviews().then(setList); }, []);

  const stats = {
    total: list.length,
    inProg: list.filter((r) => r.status === "in_progress").length,
    submitted: list.filter((r) => r.status === "submitted").length,
    shared: list.filter((r) => r.status === "shared").length,
  };

  const columns: ColumnDef<Review>[] = [
    { header: "Employee", accessorKey: "employeeName", cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <PersonAvatar name={row.original.employeeName} className="h-8 w-8" />
        <div>
          <p className="text-sm font-medium">{row.original.employeeName}</p>
          <p className="text-xs text-muted-foreground">{row.original.role}</p>
        </div>
      </div>
    ) },
    { header: "Reviewer", accessorKey: "reviewer" },
    { header: "Self", cell: ({ row }) => row.original.selfRating ? <span className="text-sm font-medium">{row.original.selfRating}.0</span> : <span className="text-xs text-muted-foreground">—</span> },
    { header: "Manager", cell: ({ row }) => row.original.managerRating ? <span className="text-sm font-medium">{row.original.managerRating}.0</span> : <span className="text-xs text-muted-foreground">—</span> },
    { header: "Final", cell: ({ row }) => row.original.finalRating ? <StatusBadge tone={row.original.finalRating >= 4 ? "success" : row.original.finalRating <= 2 ? "destructive" : "info"}>{row.original.finalRating}.0</StatusBadge> : <span className="text-xs text-muted-foreground">—</span> },
    { header: "Status", cell: ({ row }) => <StatusBadge tone={tone[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Reviews"
        description="Every review in the current cycle — filter by status, reviewer or department."
        breadcrumbs={[{ label: "HR" }, { label: "Performance" }, { label: "Employee Reviews" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: ClipboardCheck, label: "Total", value: stats.total, hint: "In current cycle" },
          { icon: Clock, label: "In progress", value: stats.inProg, hint: "Being written" },
          { icon: Send, label: "Submitted", value: stats.submitted, hint: "Awaiting calibration" },
          { icon: CheckCircle2, label: "Shared", value: stats.shared, hint: "With employees" },
        ]}
      />

      <SectionCard title={`${list.length} reviews`}>
        <DataTable columns={columns} data={list} searchPlaceholder="Search employee…" pageSize={12} />
      </SectionCard>
    </div>
  );
}
