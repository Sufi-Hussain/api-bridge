import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Shield, Receipt } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { essService } from "@/services/ess";

export const Route = createFileRoute("/_app/benefits/")({ component: BenefitsPage });

function BenefitsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void essService.getBenefits().then(setRows); }, []);
  const active = rows.filter((r) => r.status === "active");
  return <div className="space-y-6">
    <PageHeader title="Benefits" description="Review your enrolled benefits, coverage, and renewal dates." breadcrumbs={[{ label: "Finance" }, { label: "Benefits" }]} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard icon={Heart} label="Enrolled" value={active.length} /><StatCard label="Plans" value={rows.length} /><StatCard icon={Shield} label="Claims used" value={active.reduce((s, r) => s + Number(r.claims || 0), 0)} /><StatCard icon={Receipt} label="Usage" value={`${Math.round(active.reduce((s, r) => s + Number(r.usage || 0), 0) / Math.max(active.length, 1))}%`} /></div>
    <SectionCard title="My benefits"><div className="grid gap-3 md:grid-cols-2">{rows.map((row) => <div key={row.id} className="rounded-xl border border-border/60 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{row.name}</p><p className="text-xs text-muted-foreground">{row.provider} · {row.category}</p></div><StatusBadge tone={row.status === "active" ? "success" : "muted"}>{row.status}</StatusBadge></div><p className="mt-3 text-sm">{row.coverage}</p><div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Premium ${row.premium}</span><span>Renews {row.renewalDate}</span></div></div>)}</div></SectionCard>
  </div>;
}
