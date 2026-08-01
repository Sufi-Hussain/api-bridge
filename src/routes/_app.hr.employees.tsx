import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users, UserPlus, Download, Upload, Grid3x3, List, TrendingUp } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/common/data-table";
import { PersonAvatar } from "@/components/common/person-avatar";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { FilterToolbar } from "@/components/hr/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { employeeService, type Employee } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/employees")({
  head: () => ({
    meta: [
      { title: "Employee Directory · HireChamps" },
      { name: "description", content: "Complete workforce directory — search, filter and drill into every employee record." },
      { property: "og:title", content: "Employee Directory · HireChamps" },
    ],
  }),
  component: EmployeesPage,
});

const statusTone: Record<Employee["status"], StatusTone> = {
  active: "success", on_leave: "info", notice: "warning", probation: "warning", exited: "muted",
};

function EmployeesPage() {
  const [list, setList] = useState<Employee[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof employeeService.stats>> | null>(null);
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [loc, setLoc] = useState("all");

  useEffect(() => {
    employeeService.list().then(setList);
    employeeService.stats().then(setStats);
  }, []);

  const filtered = useMemo(() => list.filter((e) =>
    (dept === "all" || e.department === dept) &&
    (status === "all" || e.status === status) &&
    (loc === "all" || e.location === loc),
  ), [list, dept, status, loc]);

  const columns: ColumnDef<Employee>[] = [
    {
      header: "Employee",
      accessorKey: "name",
      cell: ({ row }) => (
        <Link to="/hr/employees/profile" className="flex items-center gap-2.5">
          <PersonAvatar name={row.original.name} className="h-8 w-8" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{row.original.name}</div>
            <div className="truncate text-xs text-muted-foreground">{row.original.empCode} · {row.original.jobTitle}</div>
          </div>
        </Link>
      ),
    },
    { header: "Department", accessorKey: "department", cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span> },
    { header: "Location", accessorKey: "location", cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{String(getValue())}</span> },
    { header: "Grade", accessorKey: "grade" },
    { header: "Manager", accessorKey: "managerName", cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{(getValue() as string) ?? "—"}</span> },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge tone={statusTone[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge>,
    },
    { header: "Joined", accessorKey: "joinDate" },
  ];

  const depts = [...new Set(list.map((e) => e.department))].sort();
  const locs = [...new Set(list.map((e) => e.location))].sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        description={`${list.length} employees across ${depts.length} departments and ${locs.length} locations.`}
        breadcrumbs={[{ label: "HR" }, { label: "Employees" }]}
        actions={
          <>
            <Button size="sm" variant="outline"><Upload className="mr-1.5 h-3.5 w-3.5" /> Import</Button>
            <Button size="sm" variant="outline"><Download className="mr-1.5 h-3.5 w-3.5" /> Export</Button>
            <Button size="sm"><UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add employee</Button>
          </>
        }
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Users, label: "Total", value: stats?.total ?? "—", hint: "Headcount" },
          { icon: Users, label: "Active", value: stats?.active ?? "—", hint: "Currently working", trend: { value: "+2.1%", direction: "up" } },
          { icon: Users, label: "On leave", value: stats?.onLeave ?? "—", hint: "Today" },
          { icon: TrendingUp, label: "On notice", value: stats?.notice ?? "—", hint: "Serving notice", trend: { value: "3 this wk", direction: "up" } },
        ]}
      />

      <FilterToolbar
        filters={[
          { id: "dept", label: "Department", value: dept, onChange: setDept, options: depts.map((d) => ({ value: d, label: d })) },
          { id: "status", label: "Status", value: status, onChange: setStatus, options: [
            { value: "active", label: "Active" }, { value: "on_leave", label: "On leave" }, { value: "probation", label: "Probation" }, { value: "notice", label: "Notice" },
          ] },
          { id: "loc", label: "Location", value: loc, onChange: setLoc, options: locs.map((l) => ({ value: l, label: l })) },
        ]}
      />

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table"><List className="mr-1.5 h-3.5 w-3.5" /> Table</TabsTrigger>
          <TabsTrigger value="grid"><Grid3x3 className="mr-1.5 h-3.5 w-3.5" /> Grid</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-4">
          <SectionCard title={`${filtered.length} employees`}>
            <DataTable columns={columns} data={filtered} searchPlaceholder="Search by name, code, title…" pageSize={15} />
          </SectionCard>
        </TabsContent>
        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, 24).map((e) => (
              <Link key={e.id} to="/hr/employees/profile" className="group rounded-lg border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <PersonAvatar name={e.name} className="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{e.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.jobTitle}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{e.department} · {e.location}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{e.empCode}</span>
                  <StatusBadge tone={statusTone[e.status]}>{e.status.replace("_", " ")}</StatusBadge>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
