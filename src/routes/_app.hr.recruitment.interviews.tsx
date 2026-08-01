import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, Video, MapPin, Phone, MessageCircle, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { recruitmentService, type Interview } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/recruitment/interviews")({
  head: () => ({
    meta: [
      { title: "Interviews · HireChamps" },
      { name: "description", content: "Schedule, track and capture feedback for every candidate interview." },
      { property: "og:title", content: "Interviews · HireChamps" },
    ],
  }),
  component: InterviewsPage,
});

const statusTone: Record<Interview["status"], StatusTone> = {
  scheduled: "info", completed: "success", cancelled: "muted", no_show: "destructive",
};
const modeIcon = { video: Video, onsite: MapPin, phone: Phone };

function InterviewsPage() {
  const [list, setList] = useState<Interview[]>([]);
  useEffect(() => { recruitmentService.interviews().then(setList); }, []);

  const upcoming = list.filter((i) => i.status === "scheduled");
  const completed = list.filter((i) => i.status === "completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        description="Interview scheduling and feedback across all requisitions."
        breadcrumbs={[{ label: "HR" }, { label: "Recruitment" }, { label: "Interviews" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Schedule</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: CalendarClock, label: "Scheduled", value: upcoming.length, hint: "Next 14 days" },
          { icon: Video, label: "Completed", value: completed.length, hint: "This month" },
          { icon: MessageCircle, label: "Feedback pending", value: completed.filter((c) => !c.feedback).length, hint: "Overdue" },
          { icon: CalendarClock, label: "Avg cycle", value: "8.2d", hint: "Time to feedback" },
        ]}
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({list.length})</TabsTrigger>
        </TabsList>
        {(["upcoming","completed","all"] as const).map((tab) => {
          const data = tab === "upcoming" ? upcoming : tab === "completed" ? completed : list;
          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              <SectionCard title={`${data.length} interviews`}>
                <ul className="divide-y divide-border/60">
                  {data.map((i) => {
                    const ModeIcon = modeIcon[i.mode];
                    return (
                      <li key={i.id} className="grid gap-3 py-3 md:grid-cols-[auto_1fr_auto] md:items-center">
                        <PersonAvatar name={i.candidateName} className="h-10 w-10" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">{i.candidateName}</span>
                            <StatusBadge tone="muted">{i.round}</StatusBadge>
                            <StatusBadge tone={statusTone[i.status]}>{i.status.replace("_", " ")}</StatusBadge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{i.role} · {i.interviewer}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><ModeIcon className="h-3 w-3" /> {i.mode}</span>
                            <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" /> {i.scheduledAt} · {i.durationMin}min</span>
                            {i.feedback && (
                              <span className="inline-flex items-center gap-1 text-success"><MessageCircle className="h-3 w-3" /> {i.feedback.recommendation.replace("_", " ")}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {i.status === "scheduled" && <Button size="sm" variant="outline">Reschedule</Button>}
                          {i.status === "completed" && !i.feedback && <Button size="sm">Add feedback</Button>}
                          {i.status === "completed" && i.feedback && <Button size="sm" variant="outline">View feedback</Button>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </SectionCard>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
