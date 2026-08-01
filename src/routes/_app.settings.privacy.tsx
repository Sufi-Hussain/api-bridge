import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Monitor, MapPin } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { essService, type ActivityEvent } from "@/services/ess";

export const Route = createFileRoute("/_app/settings/privacy")({
  head: () => ({
    meta: [
      { title: "Activity & Privacy · HireChamps" },
      { name: "description", content: "Review recent account activity and manage your privacy preferences." },
      { property: "og:title", content: "Activity & Privacy" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const [rows, setRows] = useState<ActivityEvent[]>([]);
  useEffect(() => { essService.getActivity().then(setRows); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity & Privacy"
        description="Your account activity, sign-ins and privacy preferences."
        breadcrumbs={[{ label: "Account" }, { label: "Settings" }, { label: "Privacy" }]}
      />

      <SectionCard title="Recent activity">
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Activity className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
                {(a.ip || a.device) && (
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {a.device && <span className="inline-flex items-center gap-1"><Monitor className="h-3 w-3" /> {a.device}</span>}
                    {a.ip && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.ip}</span>}
                  </p>
                )}
              </div>
              <span className="whitespace-nowrap text-[11px] text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
