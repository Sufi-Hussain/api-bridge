import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Award, Play, Clock, Star } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { essService, type Course } from "@/services/ess";

export const Route = createFileRoute("/_app/learning/courses")({
  head: () => ({
    meta: [
      { title: "Courses · Learning · HireChamps" },
      { name: "description", content: "Curated learning paths, mandatory training and self-paced courses." },
      { property: "og:title", content: "Learning · Courses" },
    ],
  }),
  component: CoursesPage,
});

const GRADIENTS: Record<string, string> = {
  "grad-1": "from-chart-1/60 to-chart-2/60",
  "grad-2": "from-chart-2/60 to-chart-3/60",
  "grad-3": "from-chart-3/60 to-chart-4/60",
  "grad-4": "from-chart-4/60 to-chart-5/60",
  "grad-5": "from-chart-5/60 to-chart-1/60",
  "grad-6": "from-primary/60 to-chart-2/60",
};

function CoursesPage() {
  const [rows, setRows] = useState<Course[]>([]);
  const [tab, setTab] = useState<"all" | "enrolled" | "mandatory" | "completed">("enrolled");
  useEffect(() => { essService.getCourses().then(setRows); }, []);

  const filtered = rows.filter((c) => {
    if (tab === "enrolled") return c.enrolled && c.progress < 100;
    if (tab === "mandatory") return c.mandatory;
    if (tab === "completed") return c.progress === 100;
    return true;
  });

  const stats = {
    enrolled: rows.filter((c) => c.enrolled).length,
    completed: rows.filter((c) => c.progress === 100).length,
    hours: rows.filter((c) => c.enrolled).reduce((s, c) => s + c.durationHours * (c.progress / 100), 0),
    mandatory: rows.filter((c) => c.mandatory && c.progress < 100).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning"
        description="Grow your skills with company-curated courses and required training."
        breadcrumbs={[{ label: "Workplace" }, { label: "Learning" }, { label: "Courses" }]}
        actions={<Button asChild variant="outline" size="sm"><Link to={"/learning/certifications" as never}><Award className="mr-1.5 h-3.5 w-3.5" /> Certifications</Link></Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={BookOpen} label="Enrolled" value={stats.enrolled} />
        <StatCard label="Completed" value={stats.completed} hint="Certificates earned" />
        <StatCard icon={Clock} label="Learning hours" value={`${Math.round(stats.hours)}h`} hint="This year" />
        <StatCard label="Mandatory pending" value={stats.mandatory} hint={stats.mandatory ? "Action needed" : "All done"} />
      </div>

      <SectionCard
        title="Catalog"
        action={
          <div className="flex gap-1.5">
            {(["enrolled", "mandatory", "completed", "all"] as const).map((f) => (
              <button key={f} onClick={() => setTab(f)}
                className={"rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors " +
                  (tab === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-accent/40")}>
                {f}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-xl border border-border/60 bg-card">
              <div className={"relative flex h-24 items-end bg-gradient-to-br p-3 text-primary-foreground " + (GRADIENTS[c.cover] ?? GRADIENTS["grad-1"])}>
                {c.mandatory && <span className="absolute right-2 top-2"><StatusBadge tone="destructive">Mandatory</StatusBadge></span>}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-90">{c.category} · {c.level}</p>
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold">{c.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{c.provider}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.durationHours}h</span>
                  <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {c.rating}</span>
                  {c.dueDate && <span className="text-warning-foreground">Due {c.dueDate}</span>}
                </div>
                {c.enrolled && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span>{c.progress === 100 ? "Completed" : "In progress"}</span>
                      <span className="text-muted-foreground">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" />
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <Button size="sm" variant={c.enrolled ? "default" : "outline"}>
                    <Play className="mr-1.5 h-3 w-3" /> {c.progress === 100 ? "Review" : c.enrolled ? "Continue" : "Enroll"}
                  </Button>
                  {c.completedOn && <span className="text-[11px] text-muted-foreground">{c.completedOn}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
