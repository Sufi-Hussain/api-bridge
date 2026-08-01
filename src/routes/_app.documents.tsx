import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Search, FileText, ShieldCheck, Award, Calendar, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { essService, type DocumentItem } from "@/services/ess";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({
    meta: [
      { title: "Documents · HireChamps" },
      { name: "description", content: "All your personal, employment, education, medical and tax documents." },
      { property: "og:title", content: "My Documents" },
    ],
  }),
  component: DocumentsPage,
});

const CATEGORY_ICONS = {
  identity: ShieldCheck,
  employment: FileText,
  education: Award,
  certificate: Award,
  tax: FileText,
  medical: FileText,
} as const;

const TONE: Record<DocumentItem["status"], "success" | "warning" | "destructive" | "muted"> = {
  verified: "success",
  pending: "warning",
  expired: "destructive",
  rejected: "destructive",
};

function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<DocumentItem["category"] | "all">("all");

  useEffect(() => { essService.getDocuments().then(setDocs); }, []);

  const filtered = docs.filter((d) =>
    (cat === "all" || d.category === cat) && d.name.toLowerCase().includes(query.toLowerCase())
  );

  const stats = {
    total: docs.length,
    verified: docs.filter((d) => d.status === "verified").length,
    pending: docs.filter((d) => d.status === "pending").length,
    expiring: docs.filter((d) => d.expiresOn && new Date(d.expiresOn).getTime() - Date.now() < 90 * 24 * 3600 * 1000 && d.status !== "expired").length,
  };

  const cats: (DocumentItem["category"] | "all")[] = ["all", "identity", "employment", "education", "certificate", "tax", "medical"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Upload, verify and manage all your work-related documents in one secure place."
        breadcrumbs={[{ label: "Me" }, { label: "Documents" }]}
        actions={<Button size="sm"><Upload className="mr-1.5 h-3.5 w-3.5" /> Upload document</Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} hint="All categories" />
        <StatCard label="Verified" value={stats.verified} hint="HR verified" />
        <StatCard label="Pending" value={stats.pending} hint="Awaiting review" />
        <StatCard label="Expiring soon" value={stats.expiring} hint="Within 90 days" />
      </div>

      <SectionCard
        title="All documents"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-9 w-56 pl-8 text-sm" />
            </div>
            <Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5" /> Filter</Button>
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={"rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors " +
                (cat === c ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-accent/40")}>
              {c}
            </button>
          ))}
        </div>
        <ul className="divide-y divide-border/60">
          {filtered.map((d) => {
            const Icon = CATEGORY_ICONS[d.category];
            return (
              <li key={d.id} className="flex items-center gap-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{d.category}</span> · {d.size} · Uploaded {d.uploaded} by {d.uploadedBy}
                    {d.expiresOn && <> · <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Expires {d.expiresOn}</span></>}
                  </p>
                </div>
                <StatusBadge tone={TONE[d.status]}>{d.status}</StatusBadge>
                <Button variant="ghost" size="sm">Download</Button>
              </li>
            );
          })}
          {filtered.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No documents match your search.</li>}
        </ul>
      </SectionCard>

      <SectionCard title="Related">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Identity documents", href: "/documents/identity" },
            { label: "Employment letters", href: "/documents/employment" },
            { label: "Certifications", href: "/documents/certificates" },
          ].map((r) => (
            <Link key={r.href} to={r.href} className="rounded-lg border border-border/60 bg-card p-3 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40">
              {r.label} →
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
