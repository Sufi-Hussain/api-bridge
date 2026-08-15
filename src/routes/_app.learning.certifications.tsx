import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { essService } from "@/services/ess";

export const Route = createFileRoute("/_app/learning/certifications")({ component: CertificationsPage });
function CertificationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void essService.getCertifications().then(setRows); }, []);
  return <div className="space-y-6"><PageHeader title="Certifications" description="Keep your professional credentials visible and current." breadcrumbs={[{ label: "Learning" }, { label: "Certifications" }]} /><SectionCard title="My certifications"><div className="grid gap-3 md:grid-cols-2">{rows.map((row) => <div key={row.id} className="rounded-xl border border-border/60 p-4"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Award className="h-4 w-4" /></span><div><p className="font-semibold">{row.name}</p><p className="text-xs text-muted-foreground">{row.issuer}</p></div></div><StatusBadge tone={row.status === "active" ? "success" : row.status === "expiring" ? "warning" : "destructive"}>{row.status}</StatusBadge></div><div className="mt-3 text-xs text-muted-foreground"><CalendarDays className="mr-1 inline h-3 w-3" /> Issued {row.issuedOn} · Expires {row.expiresOn}</div></div>)}</div></SectionCard></div>;
}
