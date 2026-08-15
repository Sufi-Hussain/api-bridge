import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { essService, type SalaryBreakdown } from "@/services/ess";

export const Route = createFileRoute("/_app/payroll/salary")({ component: SalaryPage });
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function SalaryPage() {
  const [data, setData] = useState<SalaryBreakdown | null>(null);
  useEffect(() => { void essService.getSalaryBreakdown().then(setData); }, []);
  return <div className="space-y-6">
    <PageHeader title="Salary breakdown" description="A clear view of your latest compensation and annualized pay." breadcrumbs={[{ label: "Finance" }, { label: "Payroll" }, { label: "Salary breakdown" }]} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Monthly gross" value={money(data?.monthlyGross ?? 0)} hint="Before deductions" />
      <StatCard label="Monthly net" value={money(data?.monthlyNet ?? 0)} hint="Take-home pay" />
      <StatCard label="Annual gross" value={money(data?.annualGross ?? 0)} hint="Annualized" />
      <StatCard label="Annual net" value={money(data?.annualNet ?? 0)} hint="Annualized" />
    </div>
    <SectionCard title="Latest pay components">
      <div className="divide-y divide-border/50">
        {(data?.components ?? []).map((component) => <div key={`${component.kind}-${component.label}`} className="flex items-center justify-between py-3 text-sm"><span>{component.label}</span><span className={component.kind === "deduction" ? "text-destructive" : "font-medium"}>{component.kind === "deduction" ? "−" : ""}{money(Number(component.amount))}</span></div>)}
        {!data?.components.length ? <p className="py-3 text-sm text-muted-foreground">Salary details will appear after your first payslip is issued.</p> : null}
      </div>
    </SectionCard>
  </div>;
}
