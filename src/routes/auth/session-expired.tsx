import { createFileRoute, Link, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/session-expired")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/",
  }),
  component: SessionExpiredPage,
});

function SessionExpiredPage() {
  const { redirect } = useSearch({ from: "/auth/session-expired" });
  return (
    <div className="mx-auto max-w-md py-24 px-4 text-center">
      <h1 className="text-2xl font-semibold mb-3">Your session has expired</h1>
      <p className="text-sm mb-6">
        For your security, we signed you out. Please sign in again to continue.
      </p>
      <Link
        to="/auth/login"
        search={{ redirect }}
        className="inline-block rounded bg-black text-white px-4 py-2"
      >
        Sign in
      </Link>
    </div>
  );
}
