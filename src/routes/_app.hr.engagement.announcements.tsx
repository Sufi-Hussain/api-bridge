import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, Eye, Heart, Pin, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Button } from "@/components/ui/button";
import { engagementService, type Announcement } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/engagement/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements · HireChamps" },
      { name: "description", content: "Company-wide communications and targeted announcements." },
      { property: "og:title", content: "Announcements · HireChamps" },
    ],
  }),
  component: AnnouncementsPage,
});

const catTone: Record<Announcement["category"], StatusTone> = {
  company: "info", hr: "muted", policy: "warning", event: "success", celebration: "success",
};

function AnnouncementsPage() {
  const [list, setList] = useState<Announcement[]>([]);
  useEffect(() => { engagementService.announcements().then(setList); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Company-wide news, policy updates and celebrations."
        breadcrumbs={[{ label: "HR" }, { label: "Engagement" }, { label: "Announcements" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New post</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: Megaphone, label: "Published", value: list.length, hint: "Last 30 days" },
          { icon: Pin, label: "Pinned", value: list.filter((a) => a.pinned).length, hint: "Sticky" },
          { icon: Eye, label: "Total views", value: list.reduce((s, a) => s + a.views, 0).toLocaleString(), hint: "All-time" },
          { icon: Heart, label: "Reactions", value: list.reduce((s, a) => s + a.reactions, 0).toLocaleString(), hint: "Engagement" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <SectionCard key={a.id} title={a.title} action={
            <div className="flex items-center gap-1.5">
              {a.pinned && <StatusBadge tone="warning"><Pin className="mr-1 inline h-3 w-3" /> Pinned</StatusBadge>}
              <StatusBadge tone={catTone[a.category]}>{a.category}</StatusBadge>
            </div>
          }>
            <p className="text-sm text-muted-foreground">{a.excerpt}</p>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span>{a.author} · {a.publishedAt}</span>
              <span className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.views}</span>
                <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {a.reactions}</span>
              </span>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
