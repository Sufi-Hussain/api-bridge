import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type LeaveRequest } from "@/services/ess";

export const Route = createFileRoute("/_app/leave/history")({
  head: () => ({
    meta: [
      { title: "Leave History · HireChamps" },
      { name: "description", content: "All leave requests with approval status and reasons." },
      { property: "og:title", content: "Leave History" },
    ],
  }),
  component: LeaveHistoryPage,
});

function LeaveHistoryPage() {
  const [rows, setRows] = useState<LeaveRequest[]>([]);
  useEffect(() => { essService.getLeaveRequests().then(setRows); }, []);

  const columns: ColumnDef<LeaveRequest>[] = [
    { accessorKey: "type", header: "Type" },
    { accessorKey: "from", header: "From" },
    { accessorKey: "to", header: "To" },
    { accessorKey: "days", header: "Days" },
    { accessorKey: "reason", header: "Reason", cell: ({ row }) => <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground">{row.original.reason}</span> },
    { accessorKey: "approver", header: "Approver" },
    { accessorKey: "appliedOn", header: "Applied" },
    { accessorKey: "status", header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const tone = s === "approved" ? "success" : s === "rejected" ? "destructive" : s === "pending" ? "warning" : "muted";
        return <StatusBadge tone={tone}>{s}</StatusBadge>;
      } },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave History"
        description="Full record of your leave requests across every leave type."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Leave" }, { label: "History" }]}
        actions={<Button size="sm"><Download className="mr-1.5 h-3.5 w-3.5" /> Export</Button>}
      />
      <SectionCard title="All requests">
        <DataTable columns={columns} data={rows} searchPlaceholder="Search leave type, reason…" />
      </SectionCard>
    </div>
  );
}
