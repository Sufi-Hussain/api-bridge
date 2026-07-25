import * as React from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { authExtras } from "@/lib/auth/api";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = useSearch({ from: "/auth/reset-password" });
  const nav = useNavigate();
  const [pw, setPw] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw !== confirm) return setError("Passwords do not match");
    if (pw.length < 12) return setError("Password must be at least 12 characters");
    setBusy(true);
    try {
      await authExtras.resetPassword(token, pw);
      nav({ to: "/auth/login" });
    } catch (err: any) {
      setError(err?.message ?? "Reset failed — link may be expired");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md py-16 px-4">
        <h1 className="text-2xl font-semibold mb-4">Invalid reset link</h1>
        <p className="text-sm">The reset link is missing a token. <Link to="/auth/forgot-password">Request a new one</Link>.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Set a new password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={12} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-black text-white py-2 disabled:opacity-50">
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
