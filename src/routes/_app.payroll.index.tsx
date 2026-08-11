import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Wallet,
  BadgeDollarSign,
  ReceiptText,
  ShieldCheck,
  Inbox,
  TrendingUp,
  Clock,
  Heart,
  Sparkles,
  ArrowRight,
  CalendarClock,
  Landmark,
  AlertTriangle,
  FileText,
  PiggyBank,
  Timer,
  PlaneTakeoff,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Timeline, type TimelineEvent } from "@/components/common/timeline";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  payrollService,
  type PayrollRun,
  type PayrollActivity,
  type PayrollAlert,
  type PayrollTrend,
  type DepartmentCost,
  type SalaryBand,
  type CalendarEvent,
} from "@/services/payroll";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/payroll/")({
  head: () => ({
    meta: [
      { title: "Payroll Dashboard · HireChamps" },
      {
        name: "description",
        content:
          "Executive payroll overview — payroll runs, cost trends, compensation, benefits, compliance and time-off insights.",
      },
      { property: "og:title", content: "Payroll · HireChamps" },
      {
        property: "og:description",
        content: "Modern payroll command center for finance and HR operations.",
      },
    ],
  }),
  component: PayrollDashboardPage,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const runToneMap: Record<PayrollRun["status"], StatusTone> = {
  processing: "info",
  approved: "success",
  paid: "success",
  locked: "muted",
  draft: "warning",
};

const alertTone: Record<PayrollAlert["severity"], StatusTone> = {
  high: "destructive",
  medium: "warning",
  low: "info",
};

const activityIcon = {
  run: Wallet,
  approval: Inbox,
  revision: BadgeDollarSign,
  bonus: TrendingUp,
  compliance: ShieldCheck,
} as const;

const activityTone: Record<PayrollActivity["category"], TimelineEvent["tone"]> = {
  run: "info",
  approval: "success",
  revision: "warning",
  bonus: "success",
  compliance: "default",
};

const calendarKindTone: Record<CalendarEvent["kind"], StatusTone> = {
  cutoff: "warning",
  run: "info",
  payout: "success",
  filing: "destructive",
};

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtCompact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function PayrollDashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof payrollService.getStats>> | null>(
    null,
  );
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [trend, setTrend] = useState<PayrollTrend[]>([]);
  const [dept, setDept] = useState<DepartmentCost[]>([]);
  const [bands, setBands] = useState<SalaryBand[]>([]);
  const [activities, setActivities] = useState<PayrollActivity[]>([]);
  const [alerts, setAlerts] = useState<PayrollAlert[]>([]);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    payrollService.getStats().then(setStats);
    payrollService.getRuns().then(setRuns);
    payrollService.getTrend().then(setTrend);
    payrollService.getDepartmentCost().then(setDept);
    payrollService.getSalaryDistribution().then(setBands);
    payrollService.getActivities().then(setActivities);
    payrollService.getAlerts().then(setAlerts);
    payrollService.getCalendar().then(setCalendar);
  }, []);

  const processedPct = stats
    ? Math.round((stats.processedEmployees / stats.totalEmployees) * 100)
    : 0;

  const timelineEvents: TimelineEvent[] = activities.map((a) => ({
    id: a.id,
    title: (
      <span>
        <span className="font-medium">{a.actor}</span> {a.action}{" "}
        <span className="text-muted-foreground">{a.target}</span>
      </span>
    ),
    time: a.time + " ago",
    icon: activityIcon[a.category],
    tone: activityTone[a.category],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll & Compensation"
        description="Payroll runs, compensation, benefits, tax, time and compliance — a unified command center for finance and HR."
        breadcrumbs={[{ label: "Home" }, { label: "Payroll" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to={"/pay/reports/executive" as never}>
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Reports
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={"/pay/runs/processing" as never}>
                <Wallet className="mr-1.5 h-3.5 w-3.5" /> Run payroll
              </Link>
            </Button>
          </>
        }
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-chart-3/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-info animate-pulse" />
              Jul 2026 cycle · processing
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {stats ? fmtCurrency(stats.monthlyCost) : "—"}
              <span className="ml-2 text-base font-medium text-muted-foreground">/ month</span>
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              {stats?.processedEmployees ?? 0} of {stats?.totalEmployees ?? 0} employees processed ·{" "}
              {stats?.pendingApprovals ?? 0} approvals · {stats?.pendingRevisions ?? 0} salary
              revisions awaiting sign-off.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to={"/pay/runs/approvals" as never}>
                  <Inbox className="mr-1.5 h-3.5 w-3.5" /> Approvals
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={"/pay/comp/increments" as never}>
                  <BadgeDollarSign className="mr-1.5 h-3.5 w-3.5" /> Compensation
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={"/pay/compliance" as never}>
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Compliance
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-primary">
                <Link to={"/pay/ai" as never}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Processing progress
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">{processedPct}%</span>
                <span className="pb-1 text-xs text-muted-foreground">
                  {stats?.processedEmployees ?? 0}/{stats?.totalEmployees ?? 0}
                </span>
              </div>
              <Progress value={processedPct} className="mt-2 h-1.5" />
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Compliance score
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">{stats?.complianceScore ?? 0}%</span>
                <StatusBadge tone="success" className="mb-1">
                  On track
                </StatusBadge>
              </div>
              <Progress value={stats?.complianceScore ?? 0} className="mt-2 h-1.5" />
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Attendance today
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">{stats?.attendanceRate ?? 0}%</span>
                <span className="pb-1 text-xs text-muted-foreground">
                  {stats?.onLeaveToday ?? 0} on leave
                </span>
              </div>
              <Progress value={stats?.attendanceRate ?? 0} className="mt-2 h-1.5" />
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Overtime · this month
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">
                  {fmtCompact(stats?.overtimeHours ?? 0)}h
                </span>
                <span className="pb-1 text-xs text-warning">▲ 6.2%</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Budget cap 1,400h</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Wallet}
          label="Payroll YTD"
          value={stats ? fmtCompact(stats.totalCost) : "—"}
          hint="Gross"
          trend={{ value: "+4.1%", direction: "up" }}
        />
        <StatCard
          icon={Inbox}
          label="Approvals"
          value={stats?.pendingApprovals ?? "—"}
          hint="Awaiting"
          trend={{ value: "SLA 48h", direction: "flat" }}
        />
        <StatCard
          icon={BadgeDollarSign}
          label="Revisions"
          value={stats?.pendingRevisions ?? "—"}
          hint="Salary"
          trend={{ value: "+2 wk", direction: "up" }}
        />
        <StatCard
          icon={Heart}
          label="Benefits"
          value={`${stats?.benefitEnrollment ?? 0}%`}
          hint="Enrolled"
          trend={{ value: "+3.4%", direction: "up" }}
        />
        <StatCard
          icon={ReceiptText}
          label="Claims"
          value={stats?.reimbursementBacklog ?? "—"}
          hint="Backlog"
          trend={{ value: "> 14 days", direction: "down" }}
        />
        <StatCard
          icon={Landmark}
          label="Loans"
          value={stats ? fmtCompact(stats.loansOutstanding) : "—"}
          hint="Outstanding"
          trend={{ value: "▼ 2.1%", direction: "down" }}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Payroll cost trend"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to={"/pay/analytics/payroll" as never}>
                  Analytics <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            }
          >
            <Tabs defaultValue="cost" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="cost">Cost</TabsTrigger>
                <TabsTrigger value="split">Gross vs net</TabsTrigger>
              </TabsList>
              <TabsContent value="cost">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => fmtCompact(Number(v))}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v) => fmtCurrency(Number(v))}
                      />
                      <Line
                        type="monotone"
                        dataKey="gross"
                        stroke="var(--chart-1)"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-1)" }}
                        name="Gross"
                      />
                      <Line
                        type="monotone"
                        dataKey="tax"
                        stroke="var(--chart-4)"
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-4)" }}
                        name="Tax"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="split">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => fmtCompact(Number(v))}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v) => fmtCurrency(Number(v))}
                      />
                      <Bar dataKey="net" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Net" />
                      <Bar dataKey="tax" fill="var(--chart-4)" radius={[4, 4, 0, 0]} name="Tax" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard
              title="Department-wise cost"
              action={
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link to={"/pay/reports/dept-cost" as never}>Details</Link>
                </Button>
              }
            >
              <div className="space-y-2.5">
                {dept.map((d, i) => {
                  const max = dept[0]?.cost ?? 1;
                  const pct = (d.cost / max) * 100;
                  return (
                    <div key={d.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground">
                          {fmtCurrency(d.cost)}{" "}
                          <span className="text-xs">· {d.headcount}</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Salary distribution">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Pie
                      data={bands}
                      dataKey="count"
                      nameKey="band"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {bands.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                {bands.map((b, i) => (
                  <div key={b.band} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="truncate text-muted-foreground">{b.band}</span>
                    <span className="ml-auto font-medium">{b.count}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Recent payroll runs"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to={"/pay/runs" as never}>All runs</Link>
              </Button>
            }
          >
            <div className="overflow-hidden rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs font-semibold">
                  <tr>
                    <th className="px-3 py-2 text-left">Period</th>
                    <th className="px-3 py-2 text-left">Run date</th>
                    <th className="px-3 py-2 text-right">Employees</th>
                    <th className="px-3 py-2 text-right">Gross</th>
                    <th className="px-3 py-2 text-right">Net</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="px-3 py-2.5 font-medium">{r.period}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.runDate}</td>
                      <td className="px-3 py-2.5 text-right">{r.employees.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right">{fmtCurrency(r.gross)}</td>
                      <td className="px-3 py-2.5 text-right">{fmtCurrency(r.net)}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge tone={runToneMap[r.status]}>{r.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard
            title="Payroll calendar"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to={"/pay/runs/calendar" as never}>Open</Link>
              </Button>
            }
          >
            <ul className="space-y-2">
              {calendar.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2"
                >
                  <div className="flex h-9 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
                    {c.date.split(" ")[0]}
                    <span className="text-[9px] font-medium uppercase text-primary/70">
                      {c.date.split(" ")[1]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{c.kind}</p>
                  </div>
                  <StatusBadge tone={calendarKindTone[c.kind]}>{c.kind}</StatusBadge>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Payroll alerts"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to={"/pay/compliance" as never}>View all</Link>
              </Button>
            }
          >
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <StatusBadge tone={alertTone[a.severity]}>{a.severity}</StatusBadge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link to={"/pay/payslips/current" as never}>
                  <ReceiptText className="mr-1.5 h-3.5 w-3.5" /> Payslip
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link to={"/pay/tax/declarations" as never}>
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> Tax
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link to={"/pay/reimburse/submit" as never}>
                  <PiggyBank className="mr-1.5 h-3.5 w-3.5" /> Claim
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link to={"/pay/loans/requests" as never}>
                  <Landmark className="mr-1.5 h-3.5 w-3.5" /> Loan
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link to={"/pay/timesheets/weekly" as never}>
                  <Clock className="mr-1.5 h-3.5 w-3.5" /> Timesheet
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-start">
                <Link to={"/pay/overtime/requests" as never}>
                  <Timer className="mr-1.5 h-3.5 w-3.5" /> Overtime
                </Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="Recent activity"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to={"/pay/runs/audit" as never}>Audit trail</Link>
              </Button>
            }
          >
            <Timeline events={timelineEvents} />
          </SectionCard>

          <SectionCard title="AI payroll insights">
            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Anomaly detected
                </div>
                <p className="mt-1 text-sm">
                  Sales OT is 22% above the 12-week baseline. Consider reviewing shift coverage in
                  APAC.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Forecast
                </div>
                <p className="mt-1">
                  August payroll projected at <strong>{fmtCurrency(2_182_400)}</strong> (+2.0%
                  vs Jul) driven by 14 new joiners.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <PlaneTakeoff className="h-3.5 w-3.5" /> Leave signal
                </div>
                <p className="mt-1">
                  Predicted 6.1% team on leave in week 34 — recommend advance shift rebalancing.
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="w-full text-primary">
                <Link to={"/pay/ai" as never}>
                  Open AI assistant <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Compliance status">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    stroke="var(--muted)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    stroke="var(--chart-2)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats?.complianceScore ?? 0) * 0.974} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {stats?.complianceScore ?? 0}%
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium">Statutory filings on track</p>
                <p className="text-xs text-muted-foreground">
                  Next filing: <strong>ESI · Aug 15</strong>
                </p>
                <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                  <Link to={"/pay/compliance/calendar" as never}>See calendar</Link>
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
