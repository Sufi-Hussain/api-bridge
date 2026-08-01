import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { guardRoute } from "@/lib/auth/guards";

export const Route = createFileRoute("/_app")({
  // Every route under /_app requires an authenticated session. Role- and
  // permission-specific gates live on the child routes (see _app.hr.* and
  // _app.admin.*), which layer additional `guardRoute` metadata on top.
  beforeLoad: guardRoute({ requireAuth: true }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
