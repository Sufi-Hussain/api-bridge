import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Award, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { Progress } from "@/components/ui/progress";
import { essService } from "@/services/ess";

export const Route = createFileRoute("/_app/learning/progress")({ component: LearningProgressPage });
function LearningProgressPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void essService.getCourses().then(setRows); }, []);
  const enrolled = rows.filter((r) => r.enrolled);
  const average = enrolled.length ? Math.round(enrolled.reduce((s, r) => s + Number(r.progress || 0), 0) / enrolled.length) : 0;
  return <div className="space-y-6"><PageHeader title="Learning Progress" description="Track active courses, completed learning, and required training." breadcrumbs={[{ label: "Workplace" }, { label: "Learning" }, { label: "Progress" }]} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><StatCard icon={BookOpen} label="Enrolled" value={enrolled.length} /><StatCard icon={Award} label="Completed" value={enrolled.filter((r) => r.progress === 100).length} /><StatCard icon={TrendingUp} label="Average progress" value={`${average}%`} /></div><SectionCard title="Course progress"><div className="space-y-4">{enrolled.map((row) => <div key={row.id}><div className="mb-1 flex justify-between text-sm"><span className="font-medium">{row.title}</span><span className="text-muted-foreground">{row.progress}%</span></div><Progress value={row.progress} /></div>)}</div></SectionCard></div>;
}
