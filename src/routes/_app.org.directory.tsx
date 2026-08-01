import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Mail, Phone, MapPin, Filter, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { essService, type DirectoryPerson } from "@/services/ess";

export const Route = createFileRoute("/_app/org/directory")({
  head: () => ({
    meta: [
      { title: "Company Directory · HireChamps" },
      { name: "description", content: "Search and connect with colleagues across the organization." },
      { property: "og:title", content: "Company Directory" },
    ],
  }),
  component: DirectoryPage,
});

const STATUS_TONE: Record<DirectoryPerson["status"], "success" | "warning" | "muted" | "info"> = {
  available: "success", "in-meeting": "warning", "on-leave": "muted", offline: "muted",
};

function DirectoryPage() {
  const [rows, setRows] = useState<DirectoryPerson[]>([]);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");

  useEffect(() => { essService.getDirectory().then(setRows); }, []);

  const depts = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.department)))], [rows]);
  const filtered = rows.filter((p) =>
    (dept === "All" || p.department === dept) &&
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.title.toLowerCase().includes(query.toLowerCase()) || p.department.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Directory"
        description="All colleagues across departments and locations. Search, filter, and start a conversation."
        breadcrumbs={[{ label: "Organization" }, { label: "Directory" }]}
        actions={<Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5" /> Advanced filters</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Total employees" value={rows.length} />
        <StatCard label="Departments" value={depts.length - 1} />
        <StatCard label="Locations" value={new Set(rows.map((r) => r.location)).size} />
        <StatCard label="Available now" value={rows.filter((r) => r.status === "available").length} hint="Online" />
      </div>

      <SectionCard
        title="People"
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, title, department…" className="h-9 w-72 pl-8" />
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-1.5">
          {depts.map((d) => (
            <button key={d} onClick={() => setDept(d)}
              className={"rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (dept === d ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-accent/40")}>
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40">
              <PersonAvatar name={p.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <StatusBadge tone={STATUS_TONE[p.status]}>{p.status}</StatusBadge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{p.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{p.department} · {p.location}</p>
                <div className="mt-2 flex gap-2 text-[11px] text-muted-foreground">
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" /> Email</a>
                  <span className="text-border">·</span>
                  <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" /> Call</a>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.timezone.split("/")[1]}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No people match your search.</p>}
        </div>
      </SectionCard>
    </div>
  );
}
