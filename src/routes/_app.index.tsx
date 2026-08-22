import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Coffee,
  FileText,
  Gift,
  GraduationCap,
  Megaphone,
  PlaneTakeoff,
  Sparkles,
  TrendingUp,
  Wallet,
  Target,
  Bell,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth.store";
import { dashboardService, type Announcement, type LeaveBalance, type Payslip, type TaskItem, type Holiday } from "@/services/dashboard";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard · HireChamps" },
      { name: "description", content: "Your personal workplace overview: attendance, leave, payroll, tasks, announcements and more." },
      { property: "og:title", content: "Employee Dashboard" },
      { property: "og:description", content: "Modern employee self-service portal." },
    ],
  }),
  component: DashboardPage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<any[]>([]);
  const [weeklyHours, setWeeklyHours] = useState({ worked: 0, target: 40, previous: 0 });
  const [goals, setGoals] = useState({ onTrack: 0, total: 0 });
  const [profileStatus, setProfileStatus] = useState({ percentage: 0, missing: [] as string[] });

  useEffect(() => {
    dashboardService.getAttendanceTrend().then(setAttendanceTrend);
    dashboardService.getPayrollTrend().then(setPayrollTrend);
    dashboardService.getWeeklyHoursSummary().then(setWeeklyHours);
    dashboardService.getGoals().then(setGoals);
    dashboardService.getProfileStatus().then(setProfileStatus);
    dashboardService.getLeaveBalances().then(setBalances);
    dashboardService.getPayslips().then(setPayslips);
    dashboardService.getTasks().then(setTasks);
    dashboardService.getAnnouncements().then(setAnnouncements);
    dashboardService.getHolidays().then(setHolidays);
  }, []);

  const totalLeave = balances.reduce((s, b) => s + b.total, 0);
  const usedLeave = balances.reduce((s, b) => s + b.used, 0);
  const latestPayslip = payslips[0];
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const profileCompletion = profileStatus.percentage;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-chart-2/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {greeting()}, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Here's your day at a glance. {openTasks} open task{openTasks === 1 ? "" : "s"}, with live attendance, payroll, leave, and profile data.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to={"/attendance/clock-in" as never}>
                  <Clock className="mr-1.5 h-3.5 w-3.5" /> Clock in
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/leave/apply">
                  <PlaneTakeoff className="mr-1.5 h-3.5 w-3.5" /> Apply for leave
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/payroll/payslips">
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> View payslip
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-primary">
                <Link to="/helpdesk/tickets">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Profile completion
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">{profileCompletion}%</span>
                <span className="pb-1 text-xs text-muted-foreground">3 items pending</span>
              </div>
              <Progress value={profileCompletion} className="mt-2 h-1.5" />
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Next payday
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">Unavailable</span>
                <span className="pb-1 text-xs text-muted-foreground">not configured</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Est. net ${latestPayslip?.net.toLocaleString() ?? "—"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Hours this week"
          value={`${Number(weeklyHours.worked).toFixed(1)}h`}
          hint={`Target ${weeklyHours.target}h`}
          trend={{ value: "+2.1h vs last week", direction: "up" }}
        />
        <StatCard
          icon={PlaneTakeoff}
          label="Leave balance"
          value={`${totalLeave - usedLeave}`}
          hint={`${usedLeave} of ${totalLeave} days used`}
          trend={{ value: "12 days remaining", direction: "flat" }}
        />
        <StatCard
          icon={Wallet}
          label="Est. monthly net"
          value={latestPayslip ? `$${latestPayslip.net.toLocaleString()}` : "—"}
          hint="Processing"
          trend={{ value: "+0.9% MoM", direction: "up" }}
        />
        <StatCard
          icon={Target}
          label="Goals on track"
          value={`${goals.onTrack} / ${goals.total}`}
          hint="Current performance cycle"
          trend={{ value: "Ahead of schedule", direction: "up" }}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Attendance this week"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/attendance/history">
                  View history <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            }
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend.map((item) => ({ ...item, day: new Date(item.date).toLocaleDateString(undefined, { weekday: "short" }) }))} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard
              title="Tasks"
              action={
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link to={"/tasks" as never}>All tasks</Link>
                </Button>
              }
            >
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              ) : (
                <ul className="space-y-2.5">
                  {tasks.slice(0, 4).map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-accent/40"
                    >
                      <CheckCircle2
                        className={
                          "mt-0.5 h-4 w-4 shrink-0 " +
                          (t.status === "done" ? "text-success" : "text-muted-foreground")
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">Due {t.dueDate}</p>
                      </div>
                      <StatusBadge
                        tone={
                          t.priority === "high"
                            ? "destructive"
                            : t.priority === "medium"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {t.priority}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Leave balance"
              action={
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link to={"/leave/balance" as never}>Details</Link>
                </Button>
              }
            >
              <ul className="space-y-3">
                {balances.map((b) => {
                  const pct = Math.round(((b.total - b.used) / b.total) * 100);
                  return (
                    <li key={b.type}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{b.type}</span>
                        <span className="text-muted-foreground">
                          {b.total - b.used} / {b.total} left
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>

          <SectionCard
            title="Payroll trend"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/payroll">Open payroll</Link>
              </Button>
            }
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollTrend.map((item) => ({ ...item, m: item.month }))} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Net"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-1)" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard
            title="AI insights"
            action={<StatusBadge tone="info">Preview</StatusBadge>}
          >
            <div className="space-y-3">
              {[
                {
                  icon: TrendingUp,
                  title: "You're 12% more productive on Wednesdays",
                  hint: "Based on your last 8 weeks of activity.",
                },
                {
                  icon: PlaneTakeoff,
                  title: "Consider planning leave around Dec 25",
                  hint: "Only 4 people on your team are off — good window.",
                },
                {
                  icon: GraduationCap,
                  title: "New course matches your career goal",
                  hint: "Advanced Design Systems · 4h · aligns with Q1 goals",
                },
              ].map((i, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <i.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{i.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{i.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Announcements"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to={"/org/announcements" as never}>All</Link>
              </Button>
            }
          >
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing new.</p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Megaphone className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">{a.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {a.author} · {a.date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Upcoming holidays">
            <ul className="space-y-2.5">
              {holidays.slice(0, 4).map((h) => (
                <li key={h.date} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-col items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.date}</p>
                  </div>
                  <StatusBadge tone={h.type === "public" ? "success" : "muted"}>{h.type}</StatusBadge>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="My team">
            <div className="flex -space-x-2">
              {["PR", "JD", "MS", "AK", "TN"].map((i) => (
                <Avatar key={i} className="h-9 w-9 border-2 border-card">
                  <AvatarFallback className="bg-secondary text-xs">{i}</AvatarFallback>
                </Avatar>
              ))}
              <span className="ml-3 flex h-9 items-center text-xs text-muted-foreground">
                +7 more
              </span>
            </div>
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-medium">Priya Raj · Reporting manager</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                "Great work on the Atlas kickoff yesterday!"
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Coffee, label: "Break", to: "/attendance/today" },
                { icon: FileText, label: "Payslip", to: "/payroll/payslips" },
                { icon: Gift, label: "Benefits", to: "/benefits" },
                { icon: Bell, label: "Alerts", to: "/notifications" },
                { icon: CalendarClock, label: "Schedule", to: "/attendance/schedule" },
                { icon: GraduationCap, label: "Learning", to: "/learning/courses" },
              ].map((a) => (
                <Button
                  key={a.label}
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-auto justify-start gap-2 py-2.5"
                >
                  <Link to={a.to}>
                    <a.icon className="h-3.5 w-3.5" />
                    {a.label}
                  </Link>
                </Button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
