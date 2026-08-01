import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Users, PlaneTakeoff, Home, Clock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { attendanceAdminService, type Shift } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/attendance-admin/")({
  head: () => ({
    meta: [
      { title: "Attendance Dashboard · HireChamps" },
      { name: "description", content: "Live attendance snapshot — present, absent, on-leave, WFH, late and overtime." },
      { property: "og:title", content: "Attendance · HireChamps" },
    ],
  }),
  component: AttendanceDashboard,
});

function AttendanceDashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof attendanceAdminService.stats>> | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  useEffect(() => {
    attendanceAdminService.stats().then(setStats);
    attendanceAdminService.shifts().then(setShifts);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Administration"
        description="Live workforce presence and 14-day attendance trends."
        breadcrumbs={[{ label: "HR" }, { label: "Attendance Admin" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Users, label: "Present", value: stats?.present ?? "—", hint: `${stats?.attendanceRate ?? 0}%`, trend: { value: "+1.2%", direction: "up" } },
          { icon: PlaneTakeoff, label: "On leave", value: stats?.onLeave ?? "—", hint: "Today" },
          { icon: Home, label: "Work from home", value: stats?.wfh ?? "—", hint: "Remote today" },
          { icon: AlertTriangle, label: "Late arrivals", value: stats?.lateToday ?? "—", hint: "Beyond grace" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="14-day trend" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.trend ?? []} margin={{ top: 10, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="present" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="absent" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Shifts in use">
          <ul className="space-y-2">
            {shifts.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-md border border-border/60 p-2.5">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{s.start} – {s.end}</p>
                </div>
                <StatusBadge tone="muted">{s.assigned} assigned</StatusBadge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
