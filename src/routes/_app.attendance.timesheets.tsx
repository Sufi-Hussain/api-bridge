import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { timesheetsService } from "@/services/timesheets";

export const Route = createFileRoute("/_app/attendance/timesheets")({
  head: () => ({
    meta: [
      { title: "Timesheets · HireChamps" },
      { name: "description", content: "Fill in your weekly hours per project and submit for approval." },
      { property: "og:title", content: "Timesheets · HireChamps" },
      { property: "og:description", content: "Fill in your weekly hours per project and submit for approval." },
    ],
  }),
  component: TimesheetsPage,
});

type Line = {
  id?: string | number;
  date: string;
  hours: number;
  projectId?: string | number | null;
  taskId?: string | number | null;
  projectName?: string;
  taskName?: string;
  workType?: string;
  isLocked?: boolean;
};

type RowKey = string;

const iso = (date: Date) => date.toISOString().slice(0, 10);
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function TimesheetsPage() {
  const [sheet, setSheet] = useState<any | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [newProject, setNewProject] = useState<string>("");

  const week = useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    const shift = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - shift + weekOffset * 7);
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return iso(day);
    });
    return { days, start: days[0]!, end: days[6]! };
  }, [weekOffset]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [current, projectList] = await Promise.all([
        timesheetsService.current(week.start),
        timesheetsService.projects().catch(() => []),
      ]);
      setSheet(current);
      setLines((current?.lines ?? []) as Line[]);
      setProjects(projectList as any[]);
      setDraft({});
    } catch {
      setError("We couldn’t load your timesheet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week.start]);

  // Group lines into rows: one row per project/task combination.
  const rows = useMemo(() => {
    const map = new Map<RowKey, { key: RowKey; projectId?: any; taskId?: any; label: string; sub: string; locked: boolean; cells: Record<string, Line | undefined> }>();
    for (const line of lines) {
      const key = `${line.projectId ?? line.workType ?? "other"}::${line.taskId ?? ""}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          projectId: line.projectId ?? null,
          taskId: line.taskId ?? null,
          label: line.projectName || line.workType || "Other",
          sub: line.taskName || "",
          locked: Boolean(line.isLocked),
          cells: {},
        });
      }
      const row = map.get(key)!;
      row.cells[line.date] = line;
      if (line.isLocked) row.locked = true;
    }
    return Array.from(map.values());
  }, [lines]);

  const cellValue = (rowKey: RowKey, date: string, line?: Line) => {
    const key = `${rowKey}|${date}`;
    if (key in draft) return draft[key]!;
    return line ? String(Number(line.hours ?? 0)) : "";
  };

  const rowTotal = (rowKey: RowKey, cells: Record<string, Line | undefined>) =>
    week.days.reduce((sum, date) => sum + (Number(cellValue(rowKey, date, cells[date])) || 0), 0);

  const dayTotal = (date: string) =>
    rows.reduce((sum, row) => sum + (Number(cellValue(row.key, date, row.cells[date])) || 0), 0);

  const total = week.days.reduce((sum, date) => sum + dayTotal(date), 0);
  const billable = lines.reduce((sum, line) => sum + (line.workType === "leave" || line.workType === "holiday" ? 0 : Number(line.hours || 0)), 0);
  const editable = sheet?.isEditable ?? (sheet?.status === "draft" || sheet?.status === "returned");
  const dirty = Object.keys(draft).length > 0;

  const addRow = () => {
    const project = projects.find((item) => String(item.id) === newProject);
    if (!project) return;
    setLines((existing) => [
      ...existing,
      { date: week.days[0]!, hours: 0, projectId: project.id, projectName: project.name },
    ]);
    setNewProject("");
  };

  const save = async () => {
    if (!sheet?.id) return;
    setWorking(true);
    try {
      const payload = rows.flatMap((row) =>
        week.days
          .map((date) => {
            const key = `${row.key}|${date}`;
            if (!(key in draft)) return null;
            const line = row.cells[date];
            return {
              id: line?.id,
              date,
              hours: Number(draft[key]) || 0,
              work_type: line?.workType ?? "project",
              project_id: row.projectId,
              task_id: row.taskId,
            };
          })
          .filter(Boolean),
      ) as Array<Record<string, unknown>>;
      if (!payload.length) return;
      await timesheetsService.saveLines(String(sheet.id), payload);
      toast.success("Hours saved.");
      await load();
    } catch {
      toast.error("Couldn’t save your hours.");
    } finally {
      setWorking(false);
    }
  };

  const submit = async () => {
    if (!sheet?.id) return;
    setWorking(true);
    try {
      if (dirty) await timesheetsService.saveLines(String(sheet.id), []);
      await timesheetsService.submit(String(sheet.id));
      toast.success("Timesheet submitted for approval.");
      await load();
    } catch {
      toast.error("Couldn’t submit this timesheet.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheets"
        description="Log hours per project for the week and submit for approval."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Timesheets" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset((value) => value - 1)}>
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset((value) => value + 1)}>
              Next<ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" disabled={working || !dirty || !editable} onClick={() => void save()}>
              Save
            </Button>
            <Button size="sm" disabled={working || !total || !editable} onClick={() => void submit()}>
              <Send className="mr-1.5 h-3.5 w-3.5" />Submit week
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Clock3} label="Total hours" value={`${total.toFixed(2)}h`} />
        <StatCard label="Billable" value={`${billable.toFixed(2)}h`} />
        <StatCard label="Projects" value={rows.length} />
        <StatCard label="Status" value={sheet?.status ?? "—"} />
      </div>

      <SectionCard
        title={`${week.start} → ${week.end}`}
        action={
          sheet?.status ? (
            <StatusBadge
              tone={sheet.status === "approved" ? "success" : sheet.status === "rejected" ? "destructive" : sheet.status === "submitted" ? "info" : "muted"}
            >
              {sheet.status}
            </StatusBadge>
          ) : undefined
        }
      >
        {error ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          </div>
        ) : null}
        {loading ? <p className="text-sm text-muted-foreground">Loading timesheet…</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Project</th>
                  {week.days.map((date, index) => (
                    <th key={date} className="px-2 py-2 text-center font-medium">
                      <span className="block">{DAY_LABELS[index]}</span>
                      <span className="block text-[10px] font-normal">{date.slice(5)}</span>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-border/60">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{row.label}</p>
                      {row.sub ? <p className="text-xs text-muted-foreground">{row.sub}</p> : null}
                    </td>
                    {week.days.map((date) => (
                      <td key={date} className="px-1 py-2 text-center">
                        <input
                          aria-label={`Hours for ${row.label} on ${date}`}
                          type="number"
                          min="0"
                          max="24"
                          step="0.25"
                          value={cellValue(row.key, date, row.cells[date])}
                          disabled={working || row.locked || !editable}
                          onChange={(event) =>
                            setDraft((existing) => ({ ...existing, [`${row.key}|${date}`]: event.target.value }))
                          }
                          className="w-16 rounded-md border border-input bg-background px-2 py-1 text-center text-sm disabled:opacity-60"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-medium">{rowTotal(row.key, row.cells).toFixed(2)}</td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-sm text-muted-foreground">
                      No rows yet — add a project below to start logging hours.
                    </td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <td className="py-3 pr-4 font-medium">Daily total</td>
                  {week.days.map((date) => (
                    <td key={date} className="px-2 py-3 text-center font-medium">{dayTotal(date).toFixed(2)}</td>
                  ))}
                  <td className="px-2 py-3 text-center font-semibold text-foreground">{total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}

        {editable && projects.length ? (
          <div className="mt-4 flex items-center gap-2">
            <select
              aria-label="Add project row"
              value={newProject}
              onChange={(event) => setNewProject(event.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="">Add a project…</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>{project.name}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" disabled={!newProject} onClick={addRow}>Add row</Button>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
