import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Monitor, LogOut, Shield, Fingerprint, Key, Bell as BellIcon, Sun, Moon, Palette } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { essService, type Session } from "@/services/ess";
import { useUIStore } from "@/stores/ui.store";

export const Route = createFileRoute("/_app/settings/")({
  head: () => ({
    meta: [
      { title: "Settings · HireChamps" },
      { name: "description", content: "Preferences, notifications, security and active sessions." },
      { property: "og:title", content: "Settings" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);

  useEffect(() => { essService.getSessions().then(setSessions); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage preferences, notifications, security and active sessions."
        breadcrumbs={[{ label: "Account" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="preferences">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Appearance">
            <p className="mb-3 text-xs text-muted-foreground">Choose how HireChamps looks on this device.</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Palette },
              ].map((t) => (
                <button key={t.id} onClick={() => setTheme(t.id as "light" | "dark" | "system")}
                  className={"flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors " +
                    (theme === t.id ? "border-primary bg-primary/5 text-primary" : "border-border/60 hover:bg-accent/40")}>
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Localization">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-2"><span>Language</span><span className="text-muted-foreground">English (US)</span></div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2"><span>Timezone</span><span className="text-muted-foreground">Asia/Kolkata (IST)</span></div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2"><span>Date format</span><span className="text-muted-foreground">DD MMM YYYY</span></div>
              <div className="flex items-center justify-between"><span>First day of week</span><span className="text-muted-foreground">Monday</span></div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Delivery channels">
            <ul className="divide-y divide-border/60">
              {[
                { id: "email", label: "Email", desc: "Approvals, payroll and important updates via email.", value: emailNotif, set: setEmailNotif },
                { id: "push", label: "Push notifications", desc: "Real-time alerts on this device.", value: pushNotif, set: setPushNotif },
                { id: "weekly", label: "Weekly digest", desc: "Every Monday morning summary of your week.", value: weekly, set: setWeekly },
                { id: "mentions", label: "Mentions & messages", desc: "Someone mentions you or sends a direct message.", value: mentions, set: setMentions },
              ].map((n) => (
                <li key={n.id} className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <Label htmlFor={n.id} className="text-sm font-medium">{n.label}</Label>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch id={n.id} checked={n.value} onCheckedChange={(v) => { n.set(v); toast.success("Preference saved"); }} />
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Password" action={<StatusBadge tone="success">Strong</StatusBadge>}>
            <p className="text-xs text-muted-foreground">Last changed 5 days ago. Use at least 12 characters with a mix of letters, numbers and symbols.</p>
            <Button size="sm" className="mt-3"><Key className="mr-1.5 h-3.5 w-3.5" /> Change password</Button>
          </SectionCard>
          <SectionCard title="Two-factor authentication" action={<StatusBadge tone="success">Enabled</StatusBadge>}>
            <p className="text-xs text-muted-foreground">Using authenticator app (backup codes generated). Add a hardware key for the strongest protection.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline"><Fingerprint className="mr-1.5 h-3.5 w-3.5" /> Add hardware key</Button>
              <Button size="sm" variant="ghost">Backup codes</Button>
            </div>
          </SectionCard>
          <SectionCard title="Security alerts" className="lg:col-span-2">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-3"><Shield className="h-4 w-4 text-success" /> No suspicious activity detected in the last 30 days.</li>
              <li className="flex items-center gap-3"><BellIcon className="h-4 w-4 text-primary" /> Get notified whenever a new device signs in to your account.</li>
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <SectionCard title="Active sessions" action={<Button variant="outline" size="sm"><LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out everywhere else</Button>}>
            <ul className="divide-y divide-border/60">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-4 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Monitor className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{s.device}</p>
                      {s.current && <StatusBadge tone="success">This device</StatusBadge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{s.browser} · {s.os} · {s.location} · IP {s.ip}</p>
                    <p className="text-[11px] text-muted-foreground">{s.lastActive}</p>
                  </div>
                  {!s.current && <Button variant="ghost" size="sm">Sign out</Button>}
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
