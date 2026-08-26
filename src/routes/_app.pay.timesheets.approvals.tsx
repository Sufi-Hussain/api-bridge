import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timesheetApprovalsService } from "@/services/timesheets";

export const Route = createFileRoute("/_app/pay/timesheets/approvals")({
  head: () => ({
    meta: [
      { title: "Timesheet Approvals · HireChamps" },
      { name: "description", content: "Review, approve, or return submitted team timesheets." },
      { property: "og:title", content: "Timesheet Approvals · HireChamps" },
      { property: "og:description", content: "Review, approve, or return submitted team timesheets." },
    ],
  }),
  component: ApprovalsPage,
});

type Sheet = {
  id: string;
  status: string;
  totalHours?: number | string;
  employeeName?: string;
  employee?: any;
  period?: { startDate?: string; endDate?: string } | null;
};

function ApprovalsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [comment, setComment] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSheets(await timesheetApprovalsService.pending());
    } catch {
      setError("We couldn’t load pending timesheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const decide = async (sheet: Sheet, decision: "approve" | "reject" | "return") => {
    setWorking(true);
    try {
      await timesheetApprovalsService.decide(String(sheet.id), decision, comment);
      setComment("");
      toast.success(`Timesheet ${decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "returned"}.`);
      await load();
    } catch {
      toast.error("Couldn’t record that decision.");
    } finally {
      setWorking(false);
    }
  };

  const totalHours = sheets.reduce((sum, sheet) => sum + Number(sheet.totalHours || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheet approvals"
        description="Approve, return, or reject timesheets submitted by your team."
        breadcrumbs={[{ label: "Pay & Time" }, { label: "Timesheets" }, { label: "Approvals" }]}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Awaiting decision" value={sheets.length} />
        <StatCard label="Submitted hours" value={`${totalHours.toFixed(2)}h`} />
        <StatCard
          label="Avg per sheet"
          value={`${(sheets.length ? totalHours / sheets.length : 0).toFixed(2)}h`}
        />
      </div>

      <SectionCard title="Pending timesheets">
        {error ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          </div>
        ) : null}
        {loading ? <p className="text-sm text-muted-foreground">Loading approvals…</p> : null}
        {!loading && !sheets.length && !error ? (
          <p className="text-sm text-muted-foreground">Nothing waiting on you. Nice.</p>
        ) : null}

        {sheets.length ? (
          <div className="space-y-3">
            <Input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Optional decision note (applies to your next action)"
            />
            <div className="divide-y divide-border">
              {sheets.map((sheet) => (
                <div key={sheet.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      {sheet.employeeName || sheet.employee?.fullName || `Employee ${sheet.employee ?? ""}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sheet.period?.startDate} → {sheet.period?.endDate} · {Number(sheet.totalHours || 0).toFixed(2)}h
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone="info">{sheet.status}</StatusBadge>
                    <Button size="sm" disabled={working} onClick={() => void decide(sheet, "approve")}>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={working} onClick={() => void decide(sheet, "return")}>
                      <Undo2 className="mr-1.5 h-3.5 w-3.5" />Return
                    </Button>
                    <Button size="sm" variant="outline" disabled={working} onClick={() => void decide(sheet, "reject")}>
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
