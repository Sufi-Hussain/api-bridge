import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PlaneTakeoff, PiggyBank, ScrollText, CalendarDays, Send, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { essService, type LeaveRequest } from "@/services/ess";

export const Route = createFileRoute("/_app/leave/")({
  head: () => ({
    meta: [
      { title: "Leave · HireChamps" },
      { name: "description", content: "Track leave balance, apply for time off and view request history." },
      { property: "og:title", content: "Leave · HireChamps" },
    ],
  }),
  component: LeavePage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function LeavePage() {
  const [balances, setBalances] = useState<{ type: string; total: number; used: number; pending: number }[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    essService.getLeaveBalances().then(setBalances);
    essService.getLeaveRequests().then(setRequests);
  }, []);

  const totals = balances.reduce((a, b) => ({ total: a.total + b.total, used: a.used + b.used, pending: a.pending + b.pending }), { total: 0, used: 0, pending: 0 });
  const pieData = balances.map((b) => ({ name: b.type, value: b.total - b.used }));

  const upcoming = requests.find((r) => r.status === "approved" && new Date(r.from) >= new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave"
        description="Plan time off, track balance across leave types and monitor approval status."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Leave" }]}
        actions={
          <>
            <Button asChild variant="outline" size="sm"><Link to="/leave/holidays"><CalendarDays className="mr-1.5 h-3.5 w-3.5" /> Holiday calendar</Link></Button>
            <Button asChild size="sm"><Link to="/leave/apply"><Send className="mr-1.5 h-3.5 w-3.5" /> Apply leave</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={PiggyBank} label="Available" value={totals.total - totals.used} hint={`${totals.total} total granted`} trend={{ value: `${totals.pending} in pending requests`, direction: "flat" }} />
        <StatCard icon={PlaneTakeoff} label="Used" value={totals.used} hint="Year to date" />
        <StatCard icon={Clock} label="Pending approval" value={totals.pending} hint="Awaiting manager" />
        <StatCard icon={ScrollText} label="Requests this year" value={requests.length} hint={`${requests.filter((r) => r.status === "approved").length} approved`} />
      </div>

      {upcoming && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Upcoming leave</p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">{upcoming.type}</span> · {upcoming.from} to {upcoming.to} ({upcoming.days} day{upcoming.days === 1 ? "" : "s"}) — approved by {upcoming.approver}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Leave balance by type" className="lg:col-span-2">
          <ul className="space-y-4">
            {balances.map((b) => {
              const remaining = b.total - b.used;
              const pct = Math.round((remaining / b.total) * 100);
              return (
                <li key={b.type}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{b.type}</span>
                    <span className="text-muted-foreground">{remaining} of {b.total} available{b.pending ? ` · ${b.pending} pending` : ""}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Distribution">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={72} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {pieData.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1">{d.name}</span>
                <span className="text-muted-foreground">{d.value}d</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Recent requests" action={<Button asChild variant="ghost" size="sm"><Link to="/leave/history">All requests <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>}>
        <ul className="divide-y divide-border/60">
          {requests.slice(0, 5).map((r) => {
            const Icon = r.status === "approved" ? CheckCircle2 : r.status === "rejected" ? XCircle : Clock;
            const tone = r.status === "approved" ? "success" : r.status === "rejected" ? "destructive" : r.status === "pending" ? "warning" : "muted";
            return (
              <li key={r.id} className="flex items-center gap-4 py-3">
                <Icon className={"h-5 w-5 " + (r.status === "approved" ? "text-success" : r.status === "rejected" ? "text-destructive" : "text-warning-foreground")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.type} · {r.days} day{r.days === 1 ? "" : "s"}</p>
                  <p className="text-xs text-muted-foreground">{r.from} → {r.to} · {r.reason}</p>
                </div>
                <div className="text-right">
                  <StatusBadge tone={tone as "success" | "destructive" | "warning" | "muted"}>{r.status}</StatusBadge>
                  <p className="mt-1 text-[11px] text-muted-foreground">Applied {r.appliedOn}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}
