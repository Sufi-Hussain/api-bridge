import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService } from "@/services/ess";

export const Route = createFileRoute("/_app/assets/requests")({ component: AssetRequestsPage });
function AssetRequestsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void essService.getAssetRequests().then(setRows); }, []);
  return <div className="space-y-6"><PageHeader title="Asset Requests" description="Request equipment and follow fulfillment status." breadcrumbs={[{ label: "Workplace" }, { label: "Assets" }, { label: "Requests" }]} actions={<Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New request</Button>} /><SectionCard title="My requests"><div className="space-y-2">{rows.map((row) => <div key={row.id} className="flex items-center justify-between rounded-xl border border-border/60 p-4"><div className="flex items-center gap-3"><ClipboardList className="h-4 w-4 text-primary" /><div><p className="font-medium capitalize">{row.category}</p><p className="text-xs text-muted-foreground">{row.justification} · {row.requestedOn}</p></div></div><StatusBadge tone={row.status === "approved" ? "success" : row.status === "rejected" ? "destructive" : "warning"}>{row.status}</StatusBadge></div>)}</div></SectionCard></div>;
}
