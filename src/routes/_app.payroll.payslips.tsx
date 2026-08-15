import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { essService, type Payslip } from "@/services/ess";

export const Route = createFileRoute("/_app/payroll/payslips")({
  head: () => ({
    meta: [
      { title: "Payslips · HireChamps" },
      { name: "description", content: "Download and review your monthly payslips with detailed breakdowns." },
      { property: "og:title", content: "Payslips" },
    ],
  }),
  component: PayslipsPage,
});

function currency(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

function PayslipsPage() {
  const [rows, setRows] = useState<Payslip[]>([]);
  const [selected, setSelected] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await essService.getPayslips();
      setRows(result);
      setSelected((current) => result.find((row) => row.id === current?.id) ?? result[0] ?? null);
    } catch {
      setError("We couldn’t load your payslips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const download = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      const blob = await essService.downloadPayslip(selected.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `payslip-${selected.month}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn’t download this payslip.");
    } finally {
      setWorking(false);
    }
  };

  const email = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      await essService.emailPayslip(selected.id);
      toast.success("Payslip sent to your registered work email.");
    } catch {
      toast.error("Couldn’t email this payslip.");
    } finally {
      setWorking(false);
    }
  };

  const ytdGross = rows.reduce((s, r) => s + Number(r.gross ?? 0), 0);
  const ytdNet = rows.reduce((s, r) => s + Number(r.net ?? 0), 0);
  const ytdTax = rows.reduce((s, r) => s + Number(r.tax ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslips"
        description="Monthly compensation statements with detailed earnings, deductions and tax breakdowns."
        breadcrumbs={[{ label: "Finance" }, { label: "Payroll" }, { label: "Payslips" }]}
        actions={<Button size="sm" disabled={!selected || working} onClick={download}><Download className="mr-1.5 h-3.5 w-3.5" /> {working ? "Working…" : "Download PDF"}</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="YTD gross" value={currency(ytdGross)} hint={`${rows.length} months`} />
        <StatCard label="YTD net" value={currency(ytdNet)} hint="After all deductions" />
        <StatCard label="YTD tax" value={currency(ytdTax)} hint="TDS + statutory" />
      </div>

      {error ? (
        <SectionCard title="Payslips unavailable">
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          </div>
        </SectionCard>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="History">
          {loading ? <p className="text-sm text-muted-foreground">Loading payslips…</p> : null}
          {!loading && !rows.length ? <p className="text-sm text-muted-foreground">No payslips are available yet.</p> : null}
          <ul className="space-y-1.5">
            {rows.map((p) => (
              <li key={p.id}>
                <button onClick={() => setSelected(p)}
                  className={"flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors " +
                    (selected?.id === p.id ? "border-primary/40 bg-primary/5" : "border-border/60 hover:bg-accent/40")}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Receipt className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.month}</p>
                    <p className="text-[11px] text-muted-foreground">Net {currency(p.net)}</p>
                  </div>
                  <StatusBadge tone={p.status === "paid" ? "success" : "warning"}>{p.status}</StatusBadge>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={selected ? `${selected.month} · Payslip` : "Select a payslip"} className="lg:col-span-2">
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] uppercase text-muted-foreground">Gross</p>
                  <p className="mt-1 text-lg font-semibold">{currency(selected.gross)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] uppercase text-muted-foreground">Deductions</p>
                  <p className="mt-1 text-lg font-semibold text-destructive">−{currency(Number(selected.deductions ?? 0) + Number(selected.tax ?? 0))}</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="text-[11px] uppercase text-primary">Net pay</p>
                  <p className="mt-1 text-lg font-semibold">{currency(selected.net)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Earnings</p>
                  <ul className="space-y-1.5">
                    {selected.earnings.map((e) => (
                      <li key={e.label} className="flex justify-between border-b border-border/40 py-1.5 text-sm">
                        <span>{e.label}</span><span className="font-medium tabular-nums">{currency(e.amount)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between pt-2 text-sm font-semibold">
                      <span>Total earnings</span><span className="tabular-nums">{currency(selected.gross)}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deductions</p>
                  <ul className="space-y-1.5">
                    {selected.deductionsBreakdown.map((d) => (
                      <li key={d.label} className="flex justify-between border-b border-border/40 py-1.5 text-sm">
                        <span>{d.label}</span><span className="font-medium tabular-nums text-destructive">−{currency(d.amount)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between pt-2 text-sm font-semibold">
                      <span>Total deductions</span><span className="tabular-nums text-destructive">−{currency(selected.deductions + selected.tax)}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span>{selected.period}{selected.paidOn ? ` · Paid on ${selected.paidOn}` : " · Processing"}</span>
                <Button variant="outline" size="sm" onClick={email} disabled={working}><FileText className="mr-1.5 h-3.5 w-3.5" /> Email to me</Button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
