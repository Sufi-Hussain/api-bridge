import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-24 px-4 text-center">
      <p className="text-sm font-mono text-muted-foreground">403</p>
      <h1 className="text-3xl font-semibold mt-2 mb-3">Access denied</h1>
      <p className="text-sm mb-6">
        You don't have permission to view this page. If you believe this is a
        mistake, contact your administrator.
      </p>
      <Link to="/" className="underline">Return home</Link>
    </div>
  );
}
