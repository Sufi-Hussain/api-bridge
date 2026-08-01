import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { FilterToolbar } from "@/components/hr/filter-toolbar";
import { Button } from "@/components/ui/button";
import { lifecycleService, type OnboardingTask } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/onboarding/tasks")({
  head: () => ({
    meta: [
      { title: "Onboarding Tasks · HireChamps" },
      { name: "description", content: "Every onboarding task, owner, due date and status — across all new hires." },
      { property: "og:title", content: "Onboarding Tasks · HireChamps" },
    ],
  }),
  component: TasksPage,
});

const statusTone: Record<OnboardingTask["status"], StatusTone> = {
  todo: "muted", in_progress: "info", done: "success", blocked: "destructive",
};

function TasksPage() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => { lifecycleService.onboardingTasks().then(setTasks); }, []);

  const filtered = useMemo(() => tasks.filter((t) =>
    (status === "all" || t.status === status) && (category === "all" || t.category === category),
  ), [tasks, status, category]);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const columns: ColumnDef<OnboardingTask>[] = [
    { header: "Task", accessorKey: "task", cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.task}</p>
        <p className="text-xs text-muted-foreground">{row.original.hireName}</p>
      </div>
    ) },
    { header: "Category", cell: ({ row }) => <StatusBadge tone="muted">{row.original.category}</StatusBadge> },
    { header: "Owner", accessorKey: "owner" },
    { header: "Due", accessorKey: "dueDate" },
    { header: "Status", cell: ({ row }) => <StatusBadge tone={statusTone[row.original.status]}>{row.original.status.replace("_", " ")}</StatusBadge> },
    { header: "", cell: () => <Button size="sm" variant="outline">Update</Button> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Tasks"
        description="Every task across all active onboardings — searchable and filterable."
        breadcrumbs={[{ label: "HR" }, { label: "Onboarding" }, { label: "Tasks" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: ClipboardCheck, label: "Total", value: stats.total, hint: "All tasks" },
          { icon: Clock, label: "In progress", value: stats.inProgress, hint: "Active" },
          { icon: AlertTriangle, label: "Blocked", value: stats.blocked, hint: "Needs escalation" },
          { icon: CheckCircle2, label: "Done", value: stats.done, hint: "Completed" },
        ]}
      />

      <FilterToolbar
        filters={[
          { id: "status", label: "Status", value: status, onChange: setStatus, options: Object.keys(statusTone).map((s) => ({ value: s, label: s.replace("_", " ") })) },
          { id: "cat", label: "Category", value: category, onChange: setCategory, options: ["docs","it","hr","training","meet"].map((c) => ({ value: c, label: c })) },
        ]}
      />

      <SectionCard title={`${filtered.length} tasks`}>
        <DataTable columns={columns} data={filtered} searchPlaceholder="Search task or hire…" pageSize={12} />
      </SectionCard>
    </div>
  );
}
