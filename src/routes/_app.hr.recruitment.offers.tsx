import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Handshake, CheckCircle2, XCircle, Send, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/common/data-table";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Button } from "@/components/ui/button";
import { recruitmentService, type Offer } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/recruitment/offers")({
  head: () => ({
    meta: [
      { title: "Offer Management · HireChamps" },
      { name: "description", content: "Draft, approve, send and track every offer through acceptance." },
      { property: "og:title", content: "Offers · HireChamps" },
    ],
  }),
  component: OffersPage,
});

const statusTone: Record<Offer["status"], StatusTone> = {
  draft: "muted", pending_approval: "warning", sent: "info", accepted: "success", declined: "destructive", expired: "muted",
};

function OffersPage() {
  const [list, setList] = useState<Offer[]>([]);
  useEffect(() => { recruitmentService.offers().then(setList); }, []);

  const stats = {
    total: list.length,
    accepted: list.filter((o) => o.status === "accepted").length,
    pending: list.filter((o) => o.status === "sent" || o.status === "pending_approval").length,
    declined: list.filter((o) => o.status === "declined").length,
  };
  const acceptanceRate = stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0;

  const columns: ColumnDef<Offer>[] = [
    {
      header: "Candidate",
      accessorKey: "candidateName",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <PersonAvatar name={row.original.candidateName} className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium">{row.original.candidateName}</p>
            <p className="text-xs text-muted-foreground">{row.original.role} · {row.original.department}</p>
          </div>
        </div>
      ),
    },
    { header: "CTC", cell: ({ row }) => <span className="text-sm font-medium">{row.original.currency} {row.original.ctc.toLocaleString()}</span> },
    { header: "Join date", accessorKey: "joinDate" },
    { header: "Approver", accessorKey: "approver" },
    { header: "Expires", accessorKey: "expiresAt" },
    { header: "Status", cell: ({ row }) => <StatusBadge tone={statusTone[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offer Management"
        description="Every offer from draft through acceptance — tracked in one place."
        breadcrumbs={[{ label: "HR" }, { label: "Recruitment" }, { label: "Offers" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Create offer</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Handshake, label: "Total offers", value: stats.total, hint: "This quarter" },
          { icon: Send, label: "In flight", value: stats.pending, hint: "Awaiting response" },
          { icon: CheckCircle2, label: "Accepted", value: stats.accepted, hint: `${acceptanceRate}% acceptance` },
          { icon: XCircle, label: "Declined", value: stats.declined, hint: "Follow up" },
        ]}
      />

      <SectionCard title="All offers">
        <DataTable columns={columns} data={list} searchPlaceholder="Search candidate, role…" pageSize={10} />
      </SectionCard>
    </div>
  );
}
