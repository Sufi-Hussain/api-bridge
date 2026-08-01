import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type NotificationItem } from "@/services/ess";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · HireChamps" },
      { name: "description", content: "All your workplace alerts, updates and messages in one place." },
      { property: "og:title", content: "Notifications" },
    ],
  }),
  component: NotificationsPage,
});

const CAT_TONE: Record<NotificationItem["category"], "success" | "warning" | "info" | "muted" | "destructive"> = {
  leave: "success", payroll: "info", system: "muted", team: "info", learning: "warning", helpdesk: "warning",
};

function NotificationsPage() {
  const [rows, setRows] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => { essService.getNotifications().then(setRows); }, []);

  const filtered = useMemo(() => filter === "unread" ? rows.filter((r) => !r.read) : rows, [rows, filter]);
  const unread = rows.filter((r) => !r.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unread} unread · Stay on top of approvals, payroll, security and team updates.`}
        breadcrumbs={[{ label: "Workspace" }, { label: "Notifications" }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => setRows((r) => r.map((x) => ({ ...x, read: true })))}>
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        }
      />

      <SectionCard
        title="Inbox"
        action={
          <div className="flex gap-1.5">
            {(["all", "unread"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={"rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors " +
                  (filter === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-accent/40")}>
                {f}{f === "unread" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>
        }
      >
        <ul className="divide-y divide-border/60">
          {filtered.map((n) => (
            <li key={n.id} className={"flex items-start gap-3 py-3 " + (!n.read ? "bg-primary/[0.03]" : "")}>
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.time} ago</p>
              </div>
              <StatusBadge tone={CAT_TONE[n.category]}>{n.category}</StatusBadge>
            </li>
          ))}
          {filtered.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">You're all caught up. 🎉</li>}
        </ul>
      </SectionCard>
    </div>
  );
}
