import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { HistoryIcon, Download, Shield } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { complianceService, type AuditEvent } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/compliance/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail · HireChamps" },
      { name: "description", content: "Immutable log of every sensitive action in the HR system." },
      { property: "og:title", content: "Audit Trail · HireChamps" },
    ],
  }),
  component: AuditPage,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = HistoryIcon;

function AuditPage() {
  const [list, setList] = useState<AuditEvent[]>([]);
  useEffect(() => { complianceService.audit().then(setList); }, []);

  const columns: ColumnDef<AuditEvent>[] = [
    { header: "Time", accessorKey: "timestamp" },
    { header: "Actor", accessorKey: "actor" },
    { header: "Action", accessorKey: "action", cell: ({ getValue }) => <span className="text-sm font-medium">{String(getValue())}</span> },
    { header: "Target", accessorKey: "target", cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{String(getValue())}</span> },
    { header: "Module", cell: ({ row }) => <StatusBadge tone="muted">{row.original.module}</StatusBadge> },
    { header: "IP", accessorKey: "ip", cell: ({ getValue }) => <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{String(getValue())}</code> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        description="Immutable, timestamped record of every sensitive HR action."
        breadcrumbs={[{ label: "HR" }, { label: "Compliance" }, { label: "Audit" }]}
        actions={<Button size="sm" variant="outline"><Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV</Button>}
      />

      <SectionCard title="Recent events" action={<span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Shield className="h-3 w-3" /> Retained 7 years</span>}>
        <DataTable columns={columns} data={list} searchPlaceholder="Search actor, action…" pageSize={15} />
      </SectionCard>
    </div>
  );
}
