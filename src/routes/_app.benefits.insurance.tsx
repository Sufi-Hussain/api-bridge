import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { essService } from "@/services/ess";

export const Route = createFileRoute("/_app/benefits/insurance")({ component: InsurancePage });
function InsurancePage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void essService.getBenefits().then(setRows); }, []);
  return <div className="space-y-6"><PageHeader title="Insurance" description="Your active insurance coverage and enrollment details." breadcrumbs={[{ label: "Benefits" }, { label: "Insurance" }]} /><SectionCard title="Coverage plans"><div className="space-y-3">{rows.filter((r) => /health|insurance|life/i.test(`${r.category} ${r.name}`)).map((row) => <div key={row.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Shield className="h-5 w-5" /></span><div><p className="font-semibold">{row.name}</p><p className="text-xs text-muted-foreground">{row.provider} · {row.coverage}</p></div></div><div className="flex items-center gap-4 text-right"><div className="hidden text-xs text-muted-foreground sm:block"><CalendarDays className="mr-1 inline h-3 w-3" /> Renews {row.renewalDate}</div><StatusBadge tone={row.status === "active" ? "success" : "muted"}>{row.status}</StatusBadge></div></div>)}</div></SectionCard></div>;
}
