import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Laptop, ShieldCheck, Calendar, Wrench } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type Asset } from "@/services/ess";

export const Route = createFileRoute("/_app/assets/devices")({
  head: () => ({
    meta: [
      { title: "My Devices · HireChamps" },
      { name: "description", content: "Company-assigned laptops, phones, monitors and accessories." },
      { property: "og:title", content: "My Devices" },
    ],
  }),
  component: DevicesPage,
});

const COND_TONE = { excellent: "success", good: "info", fair: "warning" } as const;

function DevicesPage() {
  const [rows, setRows] = useState<Asset[]>([]);
  useEffect(() => { essService.getAssets().then(setRows); }, []);

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const laptops = rows.filter((r) => r.category === "laptop").length;
  const software = rows.filter((r) => r.category === "software").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Devices & Assets"
        description="Everything the company has assigned to you — hardware, software and accessories."
        breadcrumbs={[{ label: "Workplace" }, { label: "Assets" }]}
        actions={<Button size="sm"><Wrench className="mr-1.5 h-3.5 w-3.5" /> Report an issue</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Laptop} label="Total assets" value={rows.length} />
        <StatCard label="Devices" value={laptops} hint="Laptops" />
        <StatCard label="Software licenses" value={software} />
        <StatCard label="Est. value" value={`$${totalValue.toLocaleString()}`} hint="Book value" />
      </div>

      <SectionCard title="Assigned to you">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map((a) => (
            <li key={a.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Laptop className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{a.name}</p>
                  <StatusBadge tone={COND_TONE[a.condition]}>{a.condition}</StatusBadge>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground">{a.serial}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Assigned {a.assignedOn}</span>
                  {a.warrantyEnd && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Warranty {a.warrantyEnd}</span>}
                  <span>${a.value.toLocaleString()}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
