import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart3, BellRing } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { timesheetApprovalsService } from "@/services/timesheets";

export const Route = createFileRoute("/_app/pay/timesheets/reports")({
  head: () => ({
    meta: [
      { title: "Timesheet Reports · HireChamps" },
      { name: "description", content: "Utilization, billable split, and submission compliance across your teams." },
      { property: "og:title", content: "Timesheet Reports · HireChamps" },
      { property: "og:description", content: "Utilization, billable split, and submission compliance across your teams." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [compliance, setCompliance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const range = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, c] = await Promise.all([
        timesheetApprovalsService.analytics(range.start, range.end),
        timesheetApprovalsService.compliance(range.end),
      ]);
      setAnalytics(a);
      setCompliance(c);
    } catch {
      setError("We couldn’t load timesheet reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.end]);

  const remind = async () => {
    setWorking(true);
    try {
      const result = await timesheetApprovalsService.remind(range.end);
      toast.success(`Reminders sent: ${result?.sent ?? 0}`);
    } catch {
      toast.error("Couldn’t send reminders.");
    } finally {
      setWorking(false);
    }
  };

  const utilization: any[] = analytics?.utilizationByEmployee ?? [];
  const missing: any[] = compliance?.missing ?? compliance?.employees ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheet reports"
        description={`Utilization and compliance for ${range.start} → ${range.end}.`}
        breadcrumbs={[{ label: "Pay & Time" }, { label: "Timesheets" }, { label: "Reports" }]}
        actions={
          <Button size="sm" variant="outline" disabled={working} onClick={() => void remind()}>
            <BellRing className="mr-1.5 h-3.5 w-3.5" />Send reminders
          </Button>
        }
      />

      {error ? (
        <SectionCard title="Reports unavailable">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          </div>
        </SectionCard>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={BarChart3} label="Total hours" value={`${Number(analytics?.totalHours ?? 0).toFixed(2)}h`} />
        <StatCard label="Billable hours" value={`${Number(analytics?.billableHours ?? 0).toFixed(2)}h`} />
        <StatCard label="Utilization" value={`${Number(analytics?.utilization ?? 0).toFixed(1)}%`} />
        <StatCard label="Missing submissions" value={missing.length} />
      </div>

      <SectionCard title="Utilization by employee">
        {loading ? <p className="text-sm text-muted-foreground">Loading reports…</p> : null}
        {!loading && !utilization.length ? (
          <p className="text-sm text-muted-foreground">No logged hours in this window.</p>
        ) : null}
        <div className="divide-y divide-border">
          {utilization.map((row, index) => (
            <div key={row.employeeId ?? index} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{row.employeeName ?? row.name ?? `Employee ${row.employeeId ?? index + 1}`}</p>
                <p className="text-sm text-muted-foreground">
                  {Number(row.totalHours ?? 0).toFixed(2)}h logged · {Number(row.billableHours ?? 0).toFixed(2)}h billable
                </p>
              </div>
              <StatusBadge tone={Number(row.utilization ?? 0) >= 80 ? "success" : Number(row.utilization ?? 0) >= 60 ? "warning" : "muted"}>
                {Number(row.utilization ?? 0).toFixed(1)}%
              </StatusBadge>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Submission compliance">
        {missing.length ? (
          <div className="divide-y divide-border">
            {missing.map((row: any, index: number) => (
              <div key={row.employeeId ?? index} className="flex items-center justify-between py-3">
                <p className="font-medium">{row.employeeName ?? row.name ?? `Employee ${row.employeeId ?? index + 1}`}</p>
                <StatusBadge tone="warning">{row.status ?? "not submitted"}</StatusBadge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Everyone in scope has submitted for this period.</p>
        )}
      </SectionCard>
    </div>
  );
}
