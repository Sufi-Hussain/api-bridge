import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { StatCard } from "@/components/common/stat-card";
import { essService } from "@/services/ess";

interface Holiday { date: string; name: string; type: string; region: string }

export const Route = createFileRoute("/_app/leave/holidays")({
  head: () => ({
    meta: [
      { title: "Holiday Calendar · HireChamps" },
      { name: "description", content: "Public and restricted holidays across regions." },
      { property: "og:title", content: "Holiday Calendar" },
    ],
  }),
  component: HolidaysPage,
});

function HolidaysPage() {
  const [rows, setRows] = useState<Holiday[]>([]);
  useEffect(() => { essService.getHolidays().then((h) => setRows(h as Holiday[])); }, []);

  const [region, setRegion] = useState<string>("All");
  const regions = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.region)))], [rows]);
  const filtered = rows.filter((r) => region === "All" || r.region === region);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday Calendar"
        description="Company-wide public holidays and regional restricted holidays."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Leave" }, { label: "Holidays" }]}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Total holidays" value={rows.length} hint="Next 12 months" />
        <StatCard label="Public" value={rows.filter((r) => r.type === "public").length} hint="Company-wide" />
        <StatCard label="Restricted" value={rows.filter((r) => r.type === "restricted").length} hint="Optional" />
      </div>

      <SectionCard
        title="Holidays"
        action={
          <div className="flex gap-1.5">
            {regions.map((r) => (
              <button key={r} onClick={() => setRegion(r)}
                className={"rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                  (region === r ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-accent/40")}>
                {r}
              </button>
            ))}
          </div>
        }
      >
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => {
            const d = new Date(h.date);
            return (
              <li key={h.date + h.name} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[10px] font-semibold uppercase">{d.toLocaleDateString(undefined, { month: "short" })}</span>
                  <span className="text-lg font-semibold">{d.getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "long" })}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {h.region}</p>
                </div>
                <StatusBadge tone={h.type === "public" ? "success" : "muted"}>{h.type}</StatusBadge>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}
