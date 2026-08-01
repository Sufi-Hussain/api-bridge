import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScrollText, CheckCircle2, Users, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { documentService, type Policy } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/documents/policies")({
  head: () => ({
    meta: [
      { title: "Policy Documents · HireChamps" },
      { name: "description", content: "Every corporate policy — versioned, published, acknowledged and audit-ready." },
      { property: "og:title", content: "Policy Documents · HireChamps" },
    ],
  }),
  component: PoliciesPage,
});

const tone: Record<Policy["status"], StatusTone> = { published: "success", draft: "warning", archived: "muted" };

function PoliciesPage() {
  const [list, setList] = useState<Policy[]>([]);
  useEffect(() => { documentService.policies().then(setList); }, []);

  const avgAck = list.filter((p) => p.status === "published").reduce((s, p) => s + p.ackRate, 0) / (list.filter((p) => p.status === "published").length || 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Documents"
        description="The single source of truth for every company policy."
        breadcrumbs={[{ label: "HR" }, { label: "Documents" }, { label: "Policies" }]}
        actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New policy</Button>}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: ScrollText, label: "Total policies", value: list.length, hint: "In library" },
          { icon: CheckCircle2, label: "Published", value: list.filter((p) => p.status === "published").length, hint: "Live" },
          { icon: Users, label: "Avg acknowledgment", value: `${Math.round(avgAck)}%`, hint: "Company-wide" },
          { icon: ScrollText, label: "Drafts", value: list.filter((p) => p.status === "draft").length, hint: "Awaiting review" },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <SectionCard key={p.id} title={p.title} action={<StatusBadge tone={tone[p.status]}>{p.status}</StatusBadge>}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.category} · {p.version}</span>
                <span>Owner: {p.owner}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Effective {p.effective}</span>
                <span>Updated {p.updatedAt}</span>
              </div>
              <p className="text-xs text-muted-foreground">Audience: {p.audience}</p>
              <div className="border-t border-border/60 pt-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Acknowledgment</span>
                  <span className="font-semibold">{p.ackRate}%</span>
                </div>
                <Progress value={p.ackRate} className="h-1" />
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
