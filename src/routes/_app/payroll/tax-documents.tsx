import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { essService, type Payslip } from "@/services/ess";

export const Route = createFileRoute("/_app/payroll/tax-documents")({ component: TaxDocumentsPage });
function TaxDocumentsPage() {
  const [documents, setDocuments] = useState<Payslip[]>([]);
  useEffect(() => { void essService.getTaxDocuments().then(setDocuments); }, []);
  const download = async (id: string, month: string) => {
    const blob = await essService.downloadPayslip(id);
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `tax-document-${month}.pdf`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-6">
    <PageHeader title="Tax documents" description="Download your available payslips and year-to-date tax records." breadcrumbs={[{ label: "Finance" }, { label: "Payroll" }, { label: "Tax documents" }]} />
    <SectionCard title="Available documents">
      <div className="divide-y divide-border/50">
        {documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{document.month} tax statement</p><p className="text-xs text-muted-foreground">Tax withheld: ₹{Number(document.tax ?? 0).toLocaleString("en-IN")}</p></div></div><Button variant="outline" size="sm" onClick={() => void download(document.id, document.month)}><Download data-icon="inline-start" /> PDF</Button></div>)}
        {!documents.length ? <p className="py-3 text-sm text-muted-foreground">No tax documents are available yet.</p> : null}
      </div>
    </SectionCard>
  </div>;
}
