import { createFileRoute, Link } from "@tanstack/react-router";
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
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  UserCheck,
  Send,
  Boxes,
  Monitor,
  ShieldAlert,
  Fingerprint,
  Activity,
  HardDrive,
  Zap,
  BadgeCheck,
  FileClock,
  Inbox,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Workflow,
  KeyRound,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getAdminKPIs,
  getServiceStatus,
  getAdminActivity,
  getAccessRequests,
  getSecurityAlerts,
  getAiInsights,
  getApiUsageSeries,
  getLoginActivitySeries,
  getLicenseDistribution,
  getDeviceComplianceDistribution,
} from "@/services/admin";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/admin/")({
  head: () => ({
    meta: [
      { title: "System Administration · HireChamps" },
      { name: "description", content: "Executive command center for organization, users, security, devices and integrations." },
      { property: "og:title", content: "System Administration · HireChamps" },
    ],
  }),
  component: AdminDashboard,
});

const PIE_COLORS = ["oklch(0.62 0.19 265)", "oklch(0.72 0.16 155)", "oklch(0.75 0.15 75)", "oklch(0.68 0.20 25)", "oklch(0.62 0.14 235)"];

function fmt(n: number) {
  return n.toLocaleString("en-US");
}
function pct(a: number, b: number) {
  return Math.round((a / b) * 100);
}

function severityTone(sev: string): StatusTone {
  return sev === "critical" || sev === "high"
    ? "destructive"
    : sev === "medium"
      ? "warning"
      : "info";
}
function statusTone(s: string): StatusTone {
  return s === "operational"
    ? "success"
    : s === "degraded"
      ? "warning"
      : s === "outage"
        ? "destructive"
        : "info";
}
function riskTone(r: string): StatusTone {
  return r === "high" ? "destructive" : r === "medium" ? "warning" : "success";
}

function AdminDashboard() {
  const k = getAdminKPIs();
  const services = getServiceStatus();
  const activity = getAdminActivity();
  const requests = getAccessRequests();
  const alerts = getSecurityAlerts();
  const insights = getAiInsights();
  const apiSeries = getApiUsageSeries();
  const loginSeries = getLoginActivitySeries();
  const licenses = getLicenseDistribution();
  const compliance = getDeviceComplianceDistribution();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration"
        description="Real-time posture across organizations, identity, applications, devices and platform services."
        breadcrumbs={[{ label: "Home" }, { label: "Admin" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/security">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Security Center
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/admin/users/invite">
                <Send className="mr-1.5 h-3.5 w-3.5" /> Invite user
              </Link>
            </Button>
          </>
        }
      />

      {/* Hero KPI band */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8"
      >
        <StatCard icon={Building2} label="Organizations" value={k.organizations} hint="Tenants" />
        <StatCard icon={Users} label="Employees" value={fmt(k.employees)} hint="Provisioned" />
        <StatCard icon={UserCheck} label="Active users" value={fmt(k.activeUsers)} trend={{ value: "+2.1% w/w", direction: "up" }} />
        <StatCard icon={Send} label="Pending invites" value={k.pendingInvitations} hint="Awaiting acceptance" />
        <StatCard icon={Boxes} label="Applications" value={k.applications} hint="Connected" />
        <StatCard icon={Monitor} label="Devices" value={fmt(k.devices)} hint="Managed" />
        <StatCard icon={ShieldAlert} label="Security alerts" value={k.securityAlerts} trend={{ value: "3 new today", direction: "down" }} />
        <StatCard icon={Fingerprint} label="Failed logins" value={k.failedLogins} hint="Last 24h" />
      </motion.div>

      {/* Health / Usage row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <SectionCard title="System health" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold tracking-tight">{k.systemHealthPct}%</span>
              <StatusBadge tone="success">All systems nominal</StatusBadge>
            </div>
            <div className="space-y-2 text-sm">
              <UsageRow icon={HardDrive} label="Storage" used={k.storageUsedGB} total={k.storageQuotaGB} unit="GB" />
              <UsageRow icon={Zap} label="API calls (24h)" used={k.apiCalls24h} total={k.apiQuota24h} />
              <UsageRow icon={BadgeCheck} label="Licenses" used={k.licensesUsed} total={k.licensesTotal} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="API traffic · last 24h"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/reports/access">Details <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="calls" stroke="oklch(0.62 0.19 265)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="License distribution" className="lg:col-span-1">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={licenses} dataKey="value" nameKey="name" innerRadius={40} outerRadius={72} paddingAngle={2}>
                  {licenses.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {licenses.map((l, i) => (
              <li key={l.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {l.name}
                </span>
                <span className="text-muted-foreground">{fmt(l.value)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Login activity + device compliance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Login activity · last 7 days" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="successful" fill="oklch(0.72 0.16 155)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="oklch(0.68 0.20 25)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Device compliance">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={compliance} dataKey="value" nameKey="name" outerRadius={72}>
                  {compliance.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {compliance.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.name}
                </span>
                <span className="text-muted-foreground">{fmt(c.value)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Alerts + Access requests + Services */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Security alerts"
          action={<Button variant="ghost" size="sm" asChild><Link to="/admin/security/events">View all</Link></Button>}
        >
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-md border border-border/60 bg-card/40 p-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <StatusBadge tone={severityTone(a.severity)}>{a.severity}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.source} · {a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title={`Pending access requests · ${k.pendingAccessRequests}`}
          action={<Button variant="ghost" size="sm" asChild><Link to="/admin/roles/assignment">Review</Link></Button>}
        >
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="rounded-md border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{r.requester}</p>
                  <StatusBadge tone={riskTone(r.risk)}>{r.risk} risk</StatusBadge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.resource}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.reason} · {r.requestedAt}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Platform services">
          <ul className="space-y-1.5">
            {services.map((s) => (
              <li key={s.name} className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.uptime}% uptime · {s.latencyMs}ms</p>
                </div>
                <StatusBadge tone={statusTone(s.status)}>{s.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Activity + AI Insights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Recent administrative activity"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/security/audit"><FileClock className="mr-1 h-3.5 w-3.5" /> Audit log</Link>
            </Button>
          }
        >
          <ol className="space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.category} · {a.timestamp}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          title="AI security insights"
          action={<Button variant="ghost" size="sm" asChild><Link to="/admin/ai"><Sparkles className="mr-1 h-3.5 w-3.5" /> Open assistant</Link></Button>}
        >
          <ul className="space-y-2">
            {insights.map((i) => (
              <li key={i.id} className="rounded-md border border-border/60 bg-gradient-to-br from-primary/[0.04] to-transparent p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{i.title}</p>
                  <StatusBadge tone={i.impact === "high" ? "warning" : "info"}>{i.impact}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.description}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Quick actions */}
      <SectionCard title="Quick actions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Invite user", icon: Send, to: "/admin/users/invite" },
            { label: "Create role", icon: ShieldCheck, to: "/admin/roles/custom" },
            { label: "Provision app", icon: Boxes, to: "/admin/apps/provisioning" },
            { label: "Assign device", icon: Monitor, to: "/admin/devices/assignment" },
            { label: "Build workflow", icon: Workflow, to: "/admin/workflows/builder" },
            { label: "Rotate API key", icon: KeyRound, to: "/admin/integrations/api-keys" },
          ].map((q) => (
            <Button key={q.label} variant="outline" className="h-auto justify-start gap-2 py-3" asChild>
              <Link to={q.to}>
                <q.icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{q.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
        <Inbox className="h-3.5 w-3.5" />
        {fmt(k.auditEvents24h)} audit events captured in the last 24 hours · retention 365 days
      </div>
    </div>
  );
}

function UsageRow({
  icon: Icon,
  label,
  used,
  total,
  unit,
}: {
  icon: typeof HardDrive;
  label: string;
  used: number;
  total: number;
  unit?: string;
}) {
  const p = pct(used, total);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="font-medium">
          {fmt(used)}{unit ? ` ${unit}` : ""} / {fmt(total)}{unit ? ` ${unit}` : ""} · {p}%
        </span>
      </div>
      <Progress value={p} className="h-1.5" />
    </div>
  );
}
