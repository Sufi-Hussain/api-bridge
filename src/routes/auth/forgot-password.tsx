import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { authExtras } from "@/lib/auth/api";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "sent" | "error">("idle");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await authExtras.forgotPassword(email);
      setState("sent");
    } catch {
      // Always show a generic success to avoid enumeration.
      setState("sent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Reset your password</h1>
      {state === "sent" ? (
        <p className="text-sm">
          If an account exists for <strong>{email}</strong>, we sent a reset link.
          Check your inbox.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button disabled={busy} className="w-full rounded bg-black text-white py-2 disabled:opacity-50">
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-4 text-sm">
        <Link to="/auth/login">Back to sign in</Link>
      </p>
    </div>
  );
}
