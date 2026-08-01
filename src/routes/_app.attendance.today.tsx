import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, Play, Square, Coffee, MapPin, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type AttendancePunch } from "@/services/ess";

export const Route = createFileRoute("/_app/attendance/today")({
  head: () => ({
    meta: [
      { title: "Today · Attendance · HireChamps" },
      { name: "description", content: "Clock in and out, track breaks, and review your day's attendance." },
      { property: "og:title", content: "Today · Attendance" },
    ],
  }),
  component: TodayPage,
});

const WEEK = [
  { day: "Mon", hours: 8.2 }, { day: "Tue", hours: 8.6 }, { day: "Wed", hours: 7.9 },
  { day: "Thu", hours: 8.4 }, { day: "Fri", hours: 6.1 }, { day: "Sat", hours: 0 }, { day: "Sun", hours: 0 },
];

function useTicker() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function TodayPage() {
  const now = useTicker();
  const [clockedIn, setClockedIn] = useState(true);
  const [inTime] = useState("09:32");
  const [punches, setPunches] = useState<AttendancePunch[]>([]);

  useEffect(() => { essService.getAttendance(7).then(setPunches); }, []);

  const elapsedMs = clockedIn
    ? now.getTime() - new Date(new Date().toDateString() + " " + inTime).getTime()
    : 0;
  const h = Math.max(0, Math.floor(elapsedMs / 3600000));
  const m = Math.max(0, Math.floor((elapsedMs % 3600000) / 60000));
  const s = Math.max(0, Math.floor((elapsedMs % 60000) / 1000));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance · Today"
        description={now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Today" }]}
        actions={
          <Button asChild variant="outline" size="sm"><Link to="/attendance/history">History <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link></Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current session</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="tabular-nums text-4xl font-semibold sm:text-5xl">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>
              <StatusBadge tone={clockedIn ? "success" : "muted"}>{clockedIn ? "Clocked in" : "Clocked out"}</StatusBadge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Since {inTime} · Shift General (9:00–18:00) · <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Bengaluru HQ · Wi-Fi verified</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {clockedIn ? (
                <Button size="sm" variant="destructive" onClick={() => setClockedIn(false)}><Square className="mr-1.5 h-3.5 w-3.5" /> Clock out</Button>
              ) : (
                <Button size="sm" onClick={() => setClockedIn(true)}><Play className="mr-1.5 h-3.5 w-3.5" /> Clock in</Button>
              )}
              <Button size="sm" variant="outline"><Coffee className="mr-1.5 h-3.5 w-3.5" /> Start break</Button>
              <Button size="sm" variant="ghost">Request correction</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-80">
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Break time</p>
              <p className="mt-1 text-xl font-semibold">45 min</p>
              <p className="text-[11px] text-muted-foreground">of 60 allotted</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Overtime</p>
              <p className="mt-1 text-xl font-semibold">0h 12m</p>
              <p className="text-[11px] text-muted-foreground">Above shift end</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="This week" value="33.2h" hint="Target 40h" trend={{ value: "+2.1h vs last week", direction: "up" }} />
        <StatCard icon={CalendarIcon} label="This month" value="142h" hint="18 of 22 days" trend={{ value: "97% attendance", direction: "up" }} />
        <StatCard label="Avg. clock-in" value="09:31" hint="Last 30 days" trend={{ value: "3 min earlier", direction: "up" }} />
        <StatCard label="Late arrivals" value="1" hint="This month" trend={{ value: "Within policy", direction: "flat" }} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Hours this week" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent days">
          <ul className="space-y-2.5">
            {punches.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5">
                <div className="w-14 shrink-0">
                  <p className="text-[10px] uppercase text-muted-foreground">{new Date(p.date).toLocaleDateString(undefined, { weekday: "short" })}</p>
                  <p className="text-sm font-semibold">{new Date(p.date).getDate()}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.workedHours > 0 ? `${p.workedHours.toFixed(1)}h` : "—"}</p>
                  <p className="text-[11px] text-muted-foreground">{p.clockIn && p.clockOut ? `${p.clockIn} – ${p.clockOut}` : "No punches"}</p>
                </div>
                <StatusBadge tone={p.status === "present" || p.status === "wfh" ? "success" : p.status === "leave" ? "warning" : "muted"}>
                  {p.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
