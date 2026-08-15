import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { essService, type BankDetails } from "@/services/ess";

export const Route = createFileRoute("/_app/payroll/bank-details")({ component: BankDetailsPage });
const mask = (value: string) => value ? `•••• ${value.slice(-4)}` : "Not provided";
function BankDetailsPage() {
  const [data, setData] = useState<BankDetails | null>(null);
  useEffect(() => { void essService.getBankDetails().then(setData); }, []);
  return <div className="space-y-6">
    <PageHeader title="Bank details" description="Your registered account for salary payments." breadcrumbs={[{ label: "Finance" }, { label: "Payroll" }, { label: "Bank details" }]} />
    <SectionCard title="Registered account">
      {data ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><p className="text-xs text-muted-foreground">Account holder</p><p className="mt-1 font-medium">{data.accountName}</p></div>
        <div><p className="text-xs text-muted-foreground">Account number</p><p className="mt-1 font-medium tabular-nums">{mask(data.accountNumber)}</p></div>
        <div><p className="text-xs text-muted-foreground">Bank</p><p className="mt-1 font-medium">{data.bank}</p></div>
        <div><p className="text-xs text-muted-foreground">IFSC</p><p className="mt-1 font-medium">{data.ifsc}</p></div>
        <div><p className="text-xs text-muted-foreground">Branch</p><p className="mt-1 font-medium">{data.branch || "Not provided"}</p></div>
        <div><p className="text-xs text-muted-foreground">Account type</p><p className="mt-1 font-medium capitalize">{data.type}</p></div>
      </div> : <p className="text-sm text-muted-foreground">No bank account is registered yet.</p>}
    </SectionCard>
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><p>For your security, account numbers are masked and this page is read-only. Contact People Operations to request a change.</p></div>
  </div>;
}
