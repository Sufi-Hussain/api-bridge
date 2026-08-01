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
  Users,
  UserPlus,
  Briefcase,
  Inbox,
  PlaneTakeoff,
  TrendingUp,
  CalendarCheck,
  Trophy,
  GraduationCap,
  ShieldAlert,
  Gift,
  Cake,
  Sparkles,
  ArrowRight,
  UserCheck,
  BarChart3,
  Network,
  ClipboardCheck,
  Handshake,
  UserMinus,
  BellRing,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Timeline, type TimelineEvent } from "@/components/common/timeline";
import { AvatarGroup } from "@/components/common/avatar-group";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  hrService,
  type ApprovalItem,
  type HRActivity,
  type HeadcountPoint,
  type HiringFunnelStage,
  type OnboardingTask,
} from "@/services/hr-basic";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/")({
  head: () => ({
    meta: [
      { title: "HR Dashboard · HireChamps" },
      { name: "description", content: "Enterprise HR administration overview — headcount, hiring, attrition, approvals, compliance and activity." },
      { property: "og:title", content: "HR Administration · HireChamps" },
      { property: "og:description", content: "Modern people operations dashboard for HR teams." },
    ],
  }),
  component: HRDashboardPage,
});

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const activityIcon = {
  hire: UserPlus,
  exit: UserMinus,
  review: ClipboardCheck,
  policy: ShieldAlert,
  leave: PlaneTakeoff,
} as const;

const activityTone: Record<HRActivity["category"], TimelineEvent["tone"]> = {
  hire: "success",
  exit: "warning",
  review: "info",
  policy: "default",
  leave: "info",
};

const approvalTone: Record<ApprovalItem["priority"], StatusTone> = {
  high: "destructive",
  medium: "warning",
  low: "muted",
};

function HRDashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof hrService.getStats>> | null>(null);
  const [trend, setTrend] = useState<HeadcountPoint[]>([]);
  const [dist, setDist] = useState<{ name: string; value: number }[]>([]);
  const [funnel, setFunnel] = useState<HiringFunnelStage[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingTask[]>([]);
  const [activities, setActivities] = useState<HRActivity[]>([]);
  const [events, setEvents] = useState<Awaited<ReturnType<typeof hrService.getUpcomingEvents>>>([]);

  useEffect(() => {
    hrService.getStats().then(setStats);
    hrService.getHeadcountTrend().then(setTrend);
    hrService.getDepartmentDistribution().then(setDist);
    hrService.getHiringFunnel().then(setFunnel);
    hrService.getApprovals().then(setApprovals);
    hrService.getOnboardingTasks().then(setOnboarding);
    hrService.getActivities().then(setActivities);
    hrService.getUpcomingEvents().then(setEvents);
  }, []);

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
        title="HR Administration"
        description="People operations at a glance — hiring, headcount, engagement, approvals and compliance across the organization."
        breadcrumbs={[{ label: "Home" }, { label: "HR" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/hr/analytics/headcount">
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Analytics
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/hr/recruitment/openings">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Post job
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
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-chart-2/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
              Live · updated moments ago
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {stats?.headcount.toLocaleString() ?? "—"} people
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              {stats?.newJoiners ?? 0} new joiners this month · {stats?.openPositions ?? 0} open positions ·{" "}
              {stats?.pendingApprovals ?? 0} pending approvals waiting for your review.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/hr/approvals">
                  <Inbox className="mr-1.5 h-3.5 w-3.5" /> Review approvals
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/hr/recruitment/pipeline">
                  <Handshake className="mr-1.5 h-3.5 w-3.5" /> Pipeline
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/hr/onboarding">
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Onboarding
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-primary">
                <Link to="/hr/analytics/reports">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
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
                Attrition · YTD
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">{stats?.attritionYtd ?? 0}%</span>
                <span className="pb-1 text-xs text-success">▼ 0.6</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Below industry avg (11.2%)</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Learning completion
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">{stats?.learningCompletion ?? 0}%</span>
                <span className="pb-1 text-xs text-muted-foreground">Q4 target 80%</span>
              </div>
              <Progress value={stats?.learningCompletion ?? 0} className="mt-2 h-1.5" />
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Compliance alerts
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-semibold">{stats?.complianceAlerts ?? 0}</span>
                <StatusBadge tone="warning" className="mb-1">Action</StatusBadge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">2 visas · 2 policy renewals</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Active" value={stats?.activeEmployees.toLocaleString() ?? "—"} hint="Employees" trend={{ value: "+2.1%", direction: "up" }} />
        <StatCard icon={UserPlus} label="New joiners" value={stats?.newJoiners ?? "—"} hint="This month" trend={{ value: "+8", direction: "up" }} />
        <StatCard icon={Briefcase} label="Open roles" value={stats?.openPositions ?? "—"} hint="Across depts" trend={{ value: "12 urgent", direction: "flat" }} />
        <StatCard icon={Handshake} label="In pipeline" value={stats?.candidatesInPipeline ?? "—"} hint="Candidates" trend={{ value: "+34 this wk", direction: "up" }} />
        <StatCard icon={Inbox} label="Approvals" value={stats?.pendingApprovals ?? "—"} hint="Pending" trend={{ value: "SLA 24h", direction: "flat" }} />
        <StatCard icon={PlaneTakeoff} label="On leave" value={stats?.onLeaveToday ?? "—"} hint="Today" trend={{ value: "3.4%", direction: "flat" }} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Employee growth"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/hr/analytics/headcount">
                  Analytics <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            }
          >
            <Tabs defaultValue="headcount" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="headcount">Headcount</TabsTrigger>
                <TabsTrigger value="movement">Movement</TabsTrigger>
              </TabsList>
              <TabsContent value="headcount">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="active" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-1)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="movement">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="new" stackId="a" radius={[4, 4, 0, 0]} fill="var(--chart-2)" name="Joins" />
                      <Bar dataKey="exits" stackId="a" radius={[4, 4, 0, 0]} fill="var(--chart-4)" name="Exits" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard
              title="Hiring funnel"
              action={
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link to="/hr/recruitment/analytics">Details</Link>
                </Button>
              }
            >
              <div className="space-y-2.5">
                {funnel.map((s, i) => {
                  const max = funnel[0]?.count ?? 1;
                  const pct = (s.count / max) * 100;
                  return (
                    <div key={s.stage}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{s.stage}</span>
                        <span className="text-muted-foreground">{s.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Department distribution">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Pie data={dist} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                      {dist.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                {dist.slice(0, 6).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Pending approvals"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/hr/approvals">Approval center</Link>
              </Button>
            }
          >
            {approvals.length === 0 ? (
              <p className="text-sm text-muted-foreground">All caught up.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {approvals.slice(0, 6).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Inbox className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.requester} · {a.type} · {a.requestedAt}
                      </p>
                    </div>
                    <StatusBadge tone={approvalTone[a.priority]}>{a.priority}</StatusBadge>
                    <Button size="sm" variant="outline">Review</Button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Onboarding tasks · this week"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/hr/onboarding/tasks">All tasks</Link>
              </Button>
            }
          >
            <ul className="space-y-2">
              {onboarding.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {t.employee.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.task}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.employee} · owner {t.owner} · due {t.dueDate}
                    </p>
                  </div>
                  <StatusBadge
                    tone={t.status === "done" ? "success" : t.status === "in_progress" ? "info" : "muted"}
                  >
                    {t.status.replace("_", " ")}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard title="AI insights" action={<StatusBadge tone="info">Preview</StatusBadge>}>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, title: "Attrition risk rising in Sales", hint: "3 employees flagged based on engagement + tenure signals." },
                { icon: UserPlus, title: "Speed up Engineering hiring", hint: "Time-to-hire is 42d — 8d above industry benchmark." },
                { icon: GraduationCap, title: "Recommend leadership program", hint: "12 managers meet the eligibility profile for L1 leadership." },
              ].map((i, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
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

          <SectionCard title="Upcoming">
            <ul className="space-y-2.5">
              {events.map((e) => {
                const icon =
                  e.tag === "birthday" ? Cake : e.tag === "anniversary" ? Gift : e.tag === "confirmation" ? UserCheck : e.tag === "cycle" ? Trophy : BellRing;
                const Icon = icon;
                return (
                  <li key={e.id} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.date}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard title="Highlights">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Cake className="h-4 w-4" /> Birthdays this week
                </span>
                <span className="font-semibold">{stats?.birthdaysThisWeek ?? 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Gift className="h-4 w-4" /> Work anniversaries
                </span>
                <span className="font-semibold">{stats?.workAnniversaries ?? 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" /> Confirmations due
                </span>
                <span className="font-semibold">{stats?.upcomingConfirmations ?? 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ClipboardCheck className="h-4 w-4" /> Pending reviews
                </span>
                <span className="font-semibold">{stats?.pendingReviews ?? 0}</span>
              </li>
            </ul>
          </SectionCard>

          <SectionCard
            title="Recent activity"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/hr/activity">All</Link>
              </Button>
            }
          >
            <Timeline events={timelineEvents.slice(0, 6)} />
          </SectionCard>

          <SectionCard
            title="Organization snapshot"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/hr/org/chart">
                  <Network className="mr-1 h-3 w-3" /> Org chart
                </Link>
              </Button>
            }
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Leadership</p>
                <AvatarGroup
                  className="mt-2"
                  people={[
                    { name: "Anjali Krishnan" },
                    { name: "Priya Menon" },
                    { name: "Ishaan Verma" },
                    { name: "Aditya Rao" },
                    { name: "Zara Khan" },
                    { name: "Kabir Shah" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/60 bg-card p-2.5">
                  <p className="text-muted-foreground">Departments</p>
                  <p className="text-lg font-semibold">10</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5">
                  <p className="text-muted-foreground">Locations</p>
                  <p className="text-lg font-semibold">7</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5">
                  <p className="text-muted-foreground">Managers</p>
                  <p className="text-lg font-semibold">148</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card p-2.5">
                  <p className="text-muted-foreground">Span of control</p>
                  <p className="text-lg font-semibold">6.4</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
