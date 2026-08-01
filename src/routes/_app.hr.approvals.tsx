import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Inbox, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { FilterToolbar } from "@/components/hr/filter-toolbar";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { approvalService, type HrApproval } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/approvals")({
  head: () => ({
    meta: [
      { title: "Approval Center · HireChamps" },
      { name: "description", content: "Central queue for HR approvals — leave, offers, promotions, expenses and more with SLA tracking." },
      { property: "og:title", content: "Approval Center · HireChamps" },
    ],
  }),
  component: ApprovalsPage,
});

const priorityTone: Record<HrApproval["priority"], StatusTone> = {
  high: "destructive", medium: "warning", low: "muted",
};

const typeLabel: Record<HrApproval["type"], string> = {
  leave: "Leave", expense: "Expense", offer: "Offer", increment: "Increment",
  asset: "Asset", promotion: "Promotion", resignation: "Resignation", requisition: "Requisition",
};

function ApprovalsPage() {
  const [list, setList] = useState<HrApproval[]>([]);
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { approvalService.list().then(setList); }, []);

  const filtered = useMemo(() => list.filter((a) =>
    (type === "all" || a.type === type) &&
    (priority === "all" || a.priority === priority) &&
    (search === "" || a.requester.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase())),
  ), [list, type, priority, search]);

  const stats = useMemo(() => ({
    total: list.length,
    high: list.filter((a) => a.priority === "high").length,
    breached: list.filter((a) => a.slaConsumed >= a.slaHours).length,
    avgAge: list.length ? Math.round(list.reduce((s, a) => s + a.slaConsumed, 0) / list.length) : 0,
  }), [list]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Center"
        description="Every HR approval — leave, offers, promotions, expenses — in one queue with SLA tracking."
        breadcrumbs={[{ label: "HR" }, { label: "Approvals" }]}
        actions={<Button size="sm"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Bulk approve</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Inbox, label: "Pending", value: stats.total, hint: "Awaiting action" },
          { icon: Clock, label: "High priority", value: stats.high, hint: "Escalated" },
          { icon: XCircle, label: "SLA breached", value: stats.breached, hint: "Overdue" },
          { icon: CheckCircle2, label: "Avg age (hrs)", value: stats.avgAge, hint: "Time to action" },
        ]}
      />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search requester or summary…"
        filters={[
          { id: "type", label: "Type", value: type, onChange: setType, options: Object.entries(typeLabel).map(([v, l]) => ({ value: v, label: l })) },
          { id: "priority", label: "Priority", value: priority, onChange: setPriority, options: [{ value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }] },
        ]}
      />

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Queue ({filtered.length})</TabsTrigger>
          <TabsTrigger value="mine">Assigned to me</TabsTrigger>
          <TabsTrigger value="delegated">Delegated</TabsTrigger>
        </TabsList>
        <TabsContent value="queue" className="mt-4">
          <SectionCard title="Awaiting your review">
            {filtered.length === 0 ? (
              <EmptyState title="All caught up" description="No approvals match your filters." />
            ) : (
              <ul className="divide-y divide-border/60">
                {filtered.map((a) => {
                  const slaPct = Math.min(100, (a.slaConsumed / a.slaHours) * 100);
                  const breached = a.slaConsumed >= a.slaHours;
                  return (
                    <li key={a.id} className="grid gap-3 py-3 md:grid-cols-[auto_1fr_auto] md:items-center">
                      <PersonAvatar name={a.requester} className="h-10 w-10" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{a.requester}</span>
                          <StatusBadge tone="muted">{typeLabel[a.type]}</StatusBadge>
                          <StatusBadge tone={priorityTone[a.priority]}>{a.priority}</StatusBadge>
                          <span className="text-xs text-muted-foreground">· {a.requesterDept}</span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{a.summary}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                            <div className={"h-full " + (breached ? "bg-destructive" : slaPct > 66 ? "bg-warning" : "bg-success")} style={{ width: `${slaPct}%` }} />
                          </div>
                          <span className={"text-[11px] " + (breached ? "text-destructive font-medium" : "text-muted-foreground")}>
                            {breached ? "SLA breached" : `${a.slaHours - a.slaConsumed}h left`}
                          </span>
                          <span className="text-[11px] text-muted-foreground">· submitted {a.submittedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline"><XCircle className="mr-1 h-3.5 w-3.5" /> Reject</Button>
                        <Button size="sm"><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve</Button>
                        <Button size="sm" variant="ghost"><ArrowRight className="h-3.5 w-3.5" /></Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <SectionCard title="Assigned to me">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">You have <span className="font-semibold text-foreground">{Math.round(stats.total * 0.6)}</span> items assigned directly to you.</p>
                <Progress value={72} className="h-1.5" />
                <p className="text-xs text-muted-foreground">72% actioned within SLA this month · above team avg (64%)</p>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="delegated" className="mt-4">
          <EmptyState title="No delegations" description="Delegated approvals from colleagues on leave appear here." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
