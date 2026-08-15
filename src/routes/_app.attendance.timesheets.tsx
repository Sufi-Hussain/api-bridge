import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Send, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type TimesheetEntry } from "@/services/ess";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/attendance/timesheets")({
  head: () => ({ meta: [{ title: "Timesheets · HireChamps" }, { name: "description", content: "Track and submit your weekly timesheet." }] }),
  component: TimesheetsPage,
});

function TimesheetsPage() {
  const [rows, setRows] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const range = useMemo(() => {
    const end = new Date(); end.setDate(end.getDate() - end.getDay() + 6 + weekOffset * 7);
    const start = new Date(end); start.setDate(end.getDate() - 6);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }, [weekOffset]);
  const load = async () => { setLoading(true); setError(null); try { setRows(await essService.getTimesheets()); } catch { setError("We couldn’t load your timesheets."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const current = rows.filter((row) => row.date >= range.start && row.date <= range.end);
  const total = current.reduce((sum, row) => sum + Number(row.hours || 0), 0);
  const overtime = current.reduce((sum, row) => sum + Number((row as TimesheetEntry & { overtimeHours?: number }).overtimeHours || 0), 0);
  const submit = async () => { setWorking(true); try { await essService.submitTimesheets(range.start, range.end); toast.success("Timesheet submitted for approval."); await load(); } catch { toast.error("Couldn’t submit this timesheet."); } finally { setWorking(false); } };
  return <div className="space-y-6">
    <PageHeader title="Timesheets" description="Review your hours and submit the current week for approval." breadcrumbs={[{ label: "Time & Attendance" }, { label: "Timesheets" }]} actions={<><Button variant="outline" size="sm" onClick={() => setWeekOffset((value) => value - 1)}>Previous week</Button><Button variant="outline" size="sm" onClick={() => setWeekOffset((value) => value + 1)}>Next week</Button><Button size="sm" onClick={submit} disabled={working || !current.length}><Send className="mr-1.5 h-3.5 w-3.5" />Submit week</Button></>} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard icon={Clock3} label="Total hours" value={`${total.toFixed(2)}h`} /><StatCard label="Regular hours" value={`${Math.max(total - overtime, 0).toFixed(2)}h`} /><StatCard label="Overtime" value={`${overtime.toFixed(2)}h`} /><StatCard label="Entries" value={current.length} /></div>
    <SectionCard title={`${range.start} to ${range.end}`}>
      {error ? <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{error}</span><Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button></div> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading timesheets…</p> : null}
      {!loading && !current.length ? <div className="flex items-center gap-3 text-sm text-muted-foreground"><Plus className="h-4 w-4" />No entries for this week yet.</div> : null}
      <div className="divide-y divide-border">{current.map((row) => <div key={row.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{row.project}</p><p className="text-sm text-muted-foreground">{row.task} · {row.date}</p></div><div className="flex items-center gap-4"><span className="text-sm font-medium">{Number(row.hours).toFixed(2)}h</span><StatusBadge tone={row.status === "approved" ? "success" : row.status === "rejected" ? "danger" : "info"}>{row.status}</StatusBadge></div></div>)}</div>
    </SectionCard>
  </div>;
}
