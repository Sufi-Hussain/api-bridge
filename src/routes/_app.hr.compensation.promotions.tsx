import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { TrendingUp, CheckCircle2, Clock, ThumbsDown } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/common/data-table";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Button } from "@/components/ui/button";
import { compensationApiService as compensationService, type Promotion } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/compensation/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions · HireChamps" },
      { name: "description", content: "Promotion recommendations — grade movement, salary impact and approval status." },
      { property: "og:title", content: "Promotions · HireChamps" },
    ],
  }),
  component: PromotionsPage,
});

const tone: Record<Promotion["status"], StatusTone> = {
  recommended: "info", approved: "success", on_hold: "warning", rejected: "destructive",
};

function PromotionsPage() {
  const [list, setList] = useState<Promotion[]>([]);
  useEffect(() => { compensationService.promotions().then(setList); }, []);

  const stats = {
    total: list.length,
    approved: list.filter((p) => p.status === "approved").length,
    pending: list.filter((p) => p.status === "recommended").length,
    avgHike: Math.round(list.reduce((s, p) => s + p.hikePct, 0) / (list.length || 1)),
  };

  const columns: ColumnDef<Promotion>[] = [
    { header: "Employee", accessorKey: "employeeName", cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.employeeName}</p>
        <p className="text-xs text-muted-foreground">{row.original.department}</p>
      </div>
    ) },
    { header: "Grade move", cell: ({ row }) => (
      <span className="text-sm"><span className="text-muted-foreground">{row.original.fromGrade}</span> → <span className="font-semibold">{row.original.toGrade}</span></span>
    ) },
    { header: "Salary", cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">₹{row.original.proposedSalary.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">from ₹{row.original.currentSalary.toLocaleString()}</p>
      </div>
    ) },
    { header: "Hike", cell: ({ row }) => (
      <StatusBadge tone={row.original.hikePct > 20 ? "warning" : "success"}>+{row.original.hikePct}%</StatusBadge>
    ) },
    { header: "Effective", accessorKey: "effective" },
    { header: "Recommender", accessorKey: "recommender" },
    { header: "Status", cell: ({ row }) => <StatusBadge tone={tone[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotion Recommendations"
        description="Review manager-recommended promotions with impact on grade, band and comp."
        breadcrumbs={[{ label: "HR" }, { label: "Compensation" }, { label: "Promotions" }]}
        actions={<Button size="sm">Calibrate</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: TrendingUp, label: "Recommended", value: stats.total, hint: "This cycle" },
          { icon: Clock, label: "Pending", value: stats.pending, hint: "Awaiting decision" },
          { icon: CheckCircle2, label: "Approved", value: stats.approved, hint: "Effective Jan 2027" },
          { icon: ThumbsDown, label: "Avg hike", value: `${stats.avgHike}%`, hint: "For promotees" },
        ]}
      />

      <SectionCard title={`${list.length} recommendations`}>
        <DataTable columns={columns} data={list} searchPlaceholder="Search employee…" pageSize={10} />
      </SectionCard>
    </div>
  );
}
