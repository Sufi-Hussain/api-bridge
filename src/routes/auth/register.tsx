import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { guardPublicOnly } from "@/lib/auth/guards";
import { authExtras } from "@/lib/auth/api";
import { apiGet } from "@/lib/api/client";
import { Organization, Paginated } from "@/types/index";

export const Route = createFileRoute("/auth/register")({
  beforeLoad: guardPublicOnly("/"),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = React.useState({
    firstName: "", lastName: "", email: "", password: "", confirm: "",
    organizationId: "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [organizations, setOrganizations] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    async function loadOrganizations() {
      try {
        const data = await apiGet<Paginated<Organization>>(
          "/api/auth/organizations/"
        );
        // console.log(data);
        setOrganizations(data.results);
      } catch (err) {
        console.error(err);
      }
    }

    loadOrganizations();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await authExtras.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        organizationId: form.organizationId || undefined,
      });
      nav({ to: "/auth/verify-email", search: { email: form.email } });
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  const field = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="First name" value={form.firstName} onChange={field("firstName")} required />
          <input className="border rounded px-3 py-2" placeholder="Last name" value={form.lastName} onChange={field("lastName")} required />
        </div>
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Work email" value={form.email} onChange={field("email")} required />
        <select
          className="w-full border rounded px-3 py-2"
          value={form.organizationId}
          onChange={(e) =>
            setForm({
              ...form,
              organizationId: e.target.value,
            })
          }
          required
        >
          <option value="">Select Organization</option>

          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" autoComplete="new-password" value={form.password} onChange={field("password")} required minLength={12} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Confirm password" autoComplete="new-password" value={form.confirm} onChange={field("confirm")} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-black text-white py-2 disabled:opacity-50">
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link to="/auth/login">Sign in</Link>
      </p>
    </div>
  );
}
