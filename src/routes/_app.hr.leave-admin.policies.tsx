import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ScrollText, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { leaveAdminService, type LeavePolicy } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/leave-admin/policies")({
  head: () => ({
    meta: [
      { title: "Leave Policies · HireChamps" },
      { name: "description", content: "Manage every leave type, entitlement and accrual rule." },
      { property: "og:title", content: "Leave Policies · HireChamps" },
    ],
  }),
  component: PoliciesPage,
});

const tone: Record<LeavePolicy["status"], StatusTone> = { active: "success", draft: "warning", archived: "muted" };

function PoliciesPage() {
  const [list, setList] = useState<LeavePolicy[]>([]);
  useEffect(() => { leaveAdminService.policies().then(setList); }, []);

  const columns: ColumnDef<LeavePolicy>[] = [
    { header: "Policy", accessorKey: "name", cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.leaveType}</p>
      </div>
    ) },
    { header: "Entitlement", cell: ({ row }) => <span className="text-sm">{row.original.entitlement} days</span> },
    { header: "Carry fwd", cell: ({ row }) => <span className="text-sm">{row.original.carryForward} days</span> },
    { header: "Accrual", accessorKey: "accrual", cell: ({ getValue }) => <span className="text-sm capitalize">{String(getValue()).replace("_", " ")}</span> },
    { header: "Min service", cell: ({ row }) => <span className="text-sm">{row.original.minService} months</span> },
    { header: "Applies to", accessorKey: "applicableTo", cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{String(getValue())}</span> },
    { header: "Status", cell: ({ row }) => <StatusBadge tone={tone[row.original.status]}>{row.original.status}</StatusBadge> },
    { header: "", cell: () => <Button size="sm" variant="outline">Edit</Button> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Policies"
        description="Every leave policy — entitlement, accrual, carry forward and eligibility rules."
        breadcrumbs={[{ label: "HR" }, { label: "Leave Admin" }, { label: "Policies" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New policy</Button>}
      />

      <SectionCard title={`${list.length} leave policies`} action={<span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ScrollText className="h-3 w-3" /> Auto-applied on join</span>}>
        <DataTable columns={columns} data={list} searchPlaceholder="Search policy or type…" pageSize={10} />
      </SectionCard>
    </div>
  );
}
