import { createFileRoute, Link } from "@tanstack/react-router";
import { Construction, ArrowLeft, Sparkles } from "lucide-react";
import { findNav, FLAT_NAV } from "@/config/navigation";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";

// Catch-all under the app shell. Every ESS route listed in navigation renders
// a professional stub here — richer per-module pages plug in later by adding
// files like `_app.leave.apply.tsx` that override this splat.
export const Route = createFileRoute("/_app/$")({
  head: ({ params }) => {
    const path = "/" + (params._splat ?? "");
    const nav = findNav(path);
    const title = nav?.label ?? "Page";
    return {
      meta: [
        { title: `${title} · HireChamps` },
        { name: "description", content: `${title} — Employee Self-Service module.` },
        { property: "og:title", content: `${title} · HireChamps` },
      ],
    };
  },
  component: StubPage,
});

function StubPage() {
  const { _splat } = Route.useParams();
  const path = "/" + (_splat ?? "");
  const nav = findNav(path);

  if (!nav) {
    return (
      <EmptyState
        title="Page not found"
        description="This section isn't configured in the navigation."
        action={
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to dashboard
            </Link>
          </Button>
        }
      />
    );
  }

  const siblings = FLAT_NAV.filter(
    (n) => n.parent && n.parent === nav.parent && n.path !== nav.path,
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title={nav.label}
        description={`${nav.section}${nav.parent ? " · " + nav.parent : ""} — this page is ready for content. All shared components, filters, mock services and permissions are wired up.`}
        breadcrumbs={[
          { label: "Home" },
          ...(nav.parent ? [{ label: nav.parent }] : []),
          { label: nav.label },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button size="sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              New
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Records" value="—" hint="Awaiting data" />
        <StatCard label="Pending" value="—" hint="Nothing to review" />
        <StatCard label="This month" value="—" hint="No activity yet" />
        <StatCard label="Status" value="Ready" hint="Module scaffolded" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Overview" className="lg:col-span-2">
          <EmptyState
            icon={Construction}
            title={`${nav.label} coming online`}
            description="This module is part of the ESS roadmap. The layout, permissions, breadcrumbs and navigation are ready — plug in the specific components and data services to complete it."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to="/">Back to dashboard</Link>
                </Button>
                <Button size="sm">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI to build this
                </Button>
              </div>
            }
          />
        </SectionCard>

        <SectionCard title="Related in this section">
          {siblings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No related pages.</p>
          ) : (
            <ul className="space-y-1.5">
              {siblings.map((s) => (
                <li key={s.path}>
                  <Link
                    to={s.path}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <span className="flex items-center gap-2">
                      {s.icon && <s.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                      {s.label}
                    </span>
                    <StatusBadge tone="muted">Open</StatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
