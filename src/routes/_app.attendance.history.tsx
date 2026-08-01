import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Download, Filter, Clock, MapPin } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type AttendancePunch } from "@/services/ess";

export const Route = createFileRoute("/_app/attendance/history")({
  head: () => ({
    meta: [
      { title: "Attendance History · HireChamps" },
      { name: "description", content: "Complete attendance history with clock-in, clock-out, hours worked and location." },
      { property: "og:title", content: "Attendance History" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [rows, setRows] = useState<AttendancePunch[]>([]);
  useEffect(() => { essService.getAttendance(60).then(setRows); }, []);

  const stats = useMemo(() => {
    const worked = rows.filter((r) => r.workedHours > 0);
    return {
      total: rows.length,
      present: worked.length,
      avg: worked.length ? (worked.reduce((s, r) => s + r.workedHours, 0) / worked.length).toFixed(1) : "0",
      wfh: rows.filter((r) => r.status === "wfh").length,
    };
  }, [rows]);

  const columns: ColumnDef<AttendancePunch>[] = [
    { accessorKey: "date", header: "Date",
      cell: ({ row }) => <span className="font-medium">{new Date(row.original.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</span> },
    { accessorKey: "clockIn", header: "Clock In", cell: ({ row }) => row.original.clockIn ?? "—" },
    { accessorKey: "clockOut", header: "Clock Out", cell: ({ row }) => row.original.clockOut ?? "—" },
    { accessorKey: "workedHours", header: "Worked", cell: ({ row }) => row.original.workedHours ? `${row.original.workedHours.toFixed(1)}h` : "—" },
    { accessorKey: "breakMinutes", header: "Break", cell: ({ row }) => row.original.breakMinutes ? `${row.original.breakMinutes}m` : "—" },
    { accessorKey: "location", header: "Location", cell: ({ row }) => <span className="inline-flex items-center gap-1 text-xs"><MapPin className="h-3 w-3" /> {row.original.location}</span> },
    { accessorKey: "status", header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const tone = s === "present" || s === "wfh" ? "success" : s === "leave" ? "warning" : s === "holiday" ? "info" : "muted";
        return <StatusBadge tone={tone}>{s}</StatusBadge>;
      } },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance History"
        description="Last 60 days of attendance, filterable and exportable."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "History" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5" /> Filter</Button>
            <Button size="sm"><Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Clock} label="Days recorded" value={stats.total} />
        <StatCard label="Days present" value={stats.present} hint="Excluding weekends" />
        <StatCard label="Avg. hours / day" value={`${stats.avg}h`} hint="Working days" />
        <StatCard label="WFH days" value={stats.wfh} hint="Last 60 days" />
      </div>

      <SectionCard title="Punch records">
        <DataTable columns={columns} data={rows} searchPlaceholder="Search by date or location…" />
      </SectionCard>
    </div>
  );
}
