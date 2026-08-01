import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, LifeBuoy } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type HelpTicket } from "@/services/ess";

export const Route = createFileRoute("/_app/helpdesk/tickets")({
  head: () => ({
    meta: [
      { title: "Support Tickets · HireChamps" },
      { name: "description", content: "Raise and track support tickets across IT, HR, Payroll and Facilities." },
      { property: "og:title", content: "Support Tickets" },
    ],
  }),
  component: TicketsPage,
});

const TONE: Record<HelpTicket["status"], "success" | "warning" | "destructive" | "muted" | "info"> = {
  open: "warning", "in-progress": "info", waiting: "warning", resolved: "success", closed: "muted",
};
const PRIO: Record<HelpTicket["priority"], "destructive" | "warning" | "info" | "muted"> = {
  urgent: "destructive", high: "destructive", medium: "warning", low: "muted",
};

function TicketsPage() {
  const [rows, setRows] = useState<HelpTicket[]>([]);
  useEffect(() => { essService.getTickets().then(setRows); }, []);

  const cols: ColumnDef<HelpTicket>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: "subject", header: "Subject", cell: ({ row }) => <span className="font-medium">{row.original.subject}</span> },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "assignee", header: "Assignee" },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <StatusBadge tone={PRIO[row.original.priority]}>{row.original.priority}</StatusBadge> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={TONE[row.original.status]}>{row.original.status}</StatusBadge> },
    { accessorKey: "updatedOn", header: "Updated" },
  ];

  const open = rows.filter((r) => r.status !== "resolved" && r.status !== "closed").length;
  const overdue = rows.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Get help from IT, HR, Payroll or Facilities — track every request in one place."
        breadcrumbs={[{ label: "Support" }, { label: "Help Desk" }, { label: "Tickets" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Raise ticket</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={LifeBuoy} label="Total tickets" value={rows.length} hint="All time" />
        <StatCard label="Open" value={open} hint="In progress" />
        <StatCard label="Urgent" value={overdue} hint="Priority focus" />
        <StatCard label="Avg. resolution" value="18h" hint="Last 30 days" />
      </div>

      <SectionCard title="Tickets">
        <DataTable columns={cols} data={rows} searchPlaceholder="Search tickets…" />
      </SectionCard>
    </div>
  );
}
