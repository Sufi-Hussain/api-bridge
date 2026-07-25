import * as React from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { authExtras } from "@/lib/auth/api";

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
    email: typeof s.email === "string" ? s.email : "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token, email } = useSearch({ from: "/auth/verify-email" });
  const [state, setState] = React.useState<"idle" | "verifying" | "ok" | "error">(
    token ? "verifying" : "idle",
  );
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await authExtras.verifyEmail(token);
        setState("ok");
      } catch (err: any) {
        setState("error");
        setMessage(err?.message ?? "Verification link invalid or expired");
      }
    })();
  }, [token]);

  async function resend() {
    if (!email) return;
    try { await authExtras.resendVerification(email); setMessage("Verification email resent."); }
    catch (err: any) { setMessage(err?.message ?? "Could not resend."); }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-4 text-center">
      <h1 className="text-2xl font-semibold mb-4">
        {state === "ok" ? "Email verified" :
         state === "error" ? "Verification failed" :
         state === "verifying" ? "Verifying…" : "Check your inbox"}
      </h1>
      <p className="text-sm mb-6">
        {state === "ok" && "You can now sign in."}
        {state === "error" && (message ?? "Please try again.")}
        {state === "idle" && email && (
          <>We sent a verification link to <strong>{email}</strong>.</>
        )}
      </p>
      <div className="space-x-4 text-sm">
        {state === "idle" && email && (
          <button className="underline" onClick={resend}>Resend email</button>
        )}
        <Link to="/auth/login">Go to sign in</Link>
      </div>
    </div>
  );
}
