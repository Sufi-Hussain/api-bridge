import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, FileText, AlertTriangle, ClipboardCheck, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { MetricsGrid } from "@/components/hr/metrics-grid";
import { Button } from "@/components/ui/button";
import { complianceService } from "@/services/hr";
import type { StatusTone } from "@/types";

export const Route = createFileRoute("/_app/hr/compliance/")({
  head: () => ({
    meta: [
      { title: "Compliance Dashboard · HireChamps" },
      { name: "description", content: "Compliance posture — open cases, contracts, BGV, policy acknowledgments and alerts." },
      { property: "og:title", content: "Compliance · HireChamps" },
    ],
  }),
  component: ComplianceDashboard,
});

const sevTone: Record<string, StatusTone> = { high: "destructive", medium: "warning", low: "info" };

function ComplianceDashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof complianceService.dashboard>> | null>(null);
  useEffect(() => { complianceService.dashboard().then(setData); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Dashboard"
        description="A single lens across contracts, BGV, policy acknowledgment and audits."
        breadcrumbs={[{ label: "HR" }, { label: "Compliance" }]}
      />

      <MetricsGrid
        columns={4}
        metrics={[
          { icon: ShieldCheck, label: "Open cases", value: data?.openCases ?? "—", hint: "Under review" },
          { icon: FileText, label: "Contracts expiring", value: data?.contractsExpiring ?? "—", hint: "Next 60 days" },
          { icon: ClipboardCheck, label: "BGV pending", value: data?.bgvPending ?? "—", hint: "In progress" },
          { icon: ShieldCheck, label: "Policy ack avg", value: `${data?.policyAckAvg ?? 0}%`, hint: "Across active" },
        ]}
      />

      <SectionCard title="Priority alerts">
        <ul className="divide-y divide-border/60">
          {(data?.alerts ?? []).map((a, i) => (
            <li key={i} className="flex items-center gap-3 py-3">
              <div className={"flex h-9 w-9 items-center justify-center rounded-lg " + (a.severity === "high" ? "bg-destructive/10 text-destructive" : a.severity === "medium" ? "bg-warning/20 text-warning-foreground" : "bg-info/10 text-info")}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.title}</p>
                <StatusBadge tone={sevTone[a.severity]}>{a.severity}</StatusBadge>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to={a.link}>Review <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
