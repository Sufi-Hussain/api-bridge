import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Receipt } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { essService, type ExpenseClaim } from "@/services/ess";

export const Route = createFileRoute("/_app/benefits/expenses")({
  head: () => ({
    meta: [
      { title: "Expense Claims · HireChamps" },
      { name: "description", content: "Submit and track expense claims with approval workflow and reimbursement status." },
      { property: "og:title", content: "Expense Claims" },
    ],
  }),
  component: ExpensesPage,
});

const TONE: Record<ExpenseClaim["status"], "success" | "warning" | "destructive" | "muted" | "info"> = {
  draft: "muted", submitted: "warning", approved: "info", reimbursed: "success", rejected: "destructive",
};

function ExpensesPage() {
  const [rows, setRows] = useState<ExpenseClaim[]>([]);
  useEffect(() => { essService.getExpenses().then(setRows); }, []);

  const stats = useMemo(() => ({
    ytd: rows.reduce((s, r) => s + r.amount, 0),
    pending: rows.filter((r) => r.status === "submitted" || r.status === "approved").reduce((s, r) => s + r.amount, 0),
    reimbursed: rows.filter((r) => r.status === "reimbursed").reduce((s, r) => s + r.amount, 0),
    open: rows.filter((r) => r.status !== "reimbursed" && r.status !== "rejected").length,
  }), [rows]);

  const columns: ColumnDef<ExpenseClaim>[] = [
    { accessorKey: "title", header: "Claim", cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Receipt className="h-3.5 w-3.5" /></span>
        <div>
          <p className="text-sm font-medium">{row.original.title}</p>
          <p className="text-[11px] text-muted-foreground capitalize">{row.original.category}</p>
        </div>
      </div>
    ) },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-medium tabular-nums">${row.original.amount.toFixed(2)}</span> },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "approver", header: "Approver" },
    { accessorKey: "receiptCount", header: "Receipts", cell: ({ row }) => `${row.original.receiptCount}` },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={TONE[row.original.status]}>{row.original.status}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Claims"
        description="Submit reimbursement claims and track approval and payment status."
        breadcrumbs={[{ label: "Finance" }, { label: "Benefits" }, { label: "Expenses" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New claim</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total claimed YTD" value={`$${stats.ytd.toFixed(0)}`} />
        <StatCard label="Awaiting reimbursement" value={`$${stats.pending.toFixed(0)}`} hint="Approved + submitted" />
        <StatCard label="Reimbursed" value={`$${stats.reimbursed.toFixed(0)}`} hint="Paid to bank" />
        <StatCard label="Open claims" value={stats.open} hint="In workflow" />
      </div>

      <SectionCard title="All claims">
        <DataTable columns={columns} data={rows} searchPlaceholder="Search claims…" />
      </SectionCard>
    </div>
  );
}
