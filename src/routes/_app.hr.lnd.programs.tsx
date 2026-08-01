import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/common/data-table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { learningService, type TrainingProgram } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/lnd/programs")({
  head: () => ({
    meta: [
      { title: "Training Programs · HireChamps" },
      { name: "description", content: "Course catalog — enrollment, completion and ratings for every program." },
      { property: "og:title", content: "Training Programs · HireChamps" },
    ],
  }),
  component: ProgramsPage,
});

function ProgramsPage() {
  const [list, setList] = useState<TrainingProgram[]>([]);
  useEffect(() => { learningService.programs().then(setList); }, []);

  const columns: ColumnDef<TrainingProgram>[] = [
    { header: "Program", accessorKey: "name", cell: ({ row }) => (
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{row.original.name}</p>
          {row.original.mandatory && <StatusBadge tone="warning">Mandatory</StatusBadge>}
        </div>
        <p className="text-xs text-muted-foreground">{row.original.category} · {row.original.format.replace("_", " ")} · {row.original.durationHrs}h</p>
      </div>
    ) },
    { header: "Enrolled", accessorKey: "enrolled" },
    { header: "Completion", cell: ({ row }) => {
      const pct = Math.round((row.original.completed / row.original.enrolled) * 100);
      return <div className="w-32">
        <div className="mb-0.5 flex items-center justify-between text-xs"><span>{pct}%</span><span className="text-muted-foreground">{row.original.completed}/{row.original.enrolled}</span></div>
        <Progress value={pct} className="h-1" />
      </div>;
    } },
    { header: "Rating", cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 text-sm">
        <Star className="h-3 w-3 fill-warning text-warning" /> {row.original.rating.toFixed(1)}
      </span>
    ) },
    { header: "Status", cell: ({ row }) => <StatusBadge tone={row.original.status === "active" ? "success" : "muted"}>{row.original.status}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Programs"
        description={`${list.length} programs across leadership, technical, compliance and soft-skills tracks.`}
        breadcrumbs={[{ label: "HR" }, { label: "L&D" }, { label: "Programs" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New program</Button>}
      />

      <SectionCard title="Catalog">
        <DataTable columns={columns} data={list} searchPlaceholder="Search program, category…" pageSize={10} />
      </SectionCard>
    </div>
  );
}
