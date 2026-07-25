# Enterprise Auth + RBAC + Multi-tenancy — Generated Scaffold

Everything below is **new**. No existing files were modified.
Merge these into your project; each file has a header explaining intent.

## Frontend (TanStack Start)

| File | Purpose | New? |
| ---- | ------- | ---- |
| `src/lib/auth/types.ts` | Shared auth types (`AuthUser`, `RouteAuthMeta`). | New |
| `src/lib/auth/permissions.ts` | Pure helpers: `hasRole`, `hasPermission`, `belongsToOrganization`, `canAccess`. No React. | New |
| `src/lib/auth/api.ts` | Client calls for register / verify-email / forgot / reset / change-password. Uses existing `apiPost`. | New |
| `src/lib/auth/context.tsx` | `AuthProvider`, `useAuth`, `<Can>` conditional renderer. Wires `authService.onUnauthorized` → `status="expired"`. | New |
| `src/lib/auth/guards.ts` | `guardRoute(meta)` for `beforeLoad`, plus `guardPublicOnly()`. Redirects to login / unauthorized / session-expired. SSR-safe. | New |
| `src/lib/auth/index.ts` | Barrel. | New |
| `src/routes/auth/login.tsx` | Login page. | New |
| `src/routes/auth/register.tsx` | Register + optional org creation. | New |
| `src/routes/auth/forgot-password.tsx` | Request reset link (enumeration-safe). | New |
| `src/routes/auth/reset-password.tsx` | Consume reset token, set new password. | New |
| `src/routes/auth/verify-email.tsx` | Consume verification token / resend. | New |
| `src/routes/auth/unauthorized.tsx` | 403 page. | New |
| `src/routes/auth/session-expired.tsx` | Session-expired page with redirect back. | New |

**Dependencies:** none beyond what your project already has (`@tanstack/react-router`, `axios`, `react`). Re-run route-tree generation (`bun run dev` or your route:gen script) so `routeTree.gen.ts` picks the new files up.

**How to wire the provider** (top-level, once — e.g. in `src/routes/__root.tsx`):

```tsx
import { AuthProvider } from "@/lib/auth";
// ...inside RootComponent:
<AuthProvider><Outlet /></AuthProvider>
```

**How to protect a route:**

```tsx
// src/routes/_authenticated.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { guardRoute } from "@/lib/auth";
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: guardRoute({ requireAuth: true }),
  component: () => <Outlet />,
});
```

```tsx
// src/routes/_authenticated/payroll.tsx — permission-gated
export const Route = createFileRoute("/_authenticated/payroll")({
  beforeLoad: guardRoute({ requireAuth: true, permissions: ["payroll.read"] }),
  component: PayrollPage,
});
```

---

## Backend (Django + DRF + SimpleJWT)

All files live under `backend/` in this scaffold — move them into your Django project at the equivalent paths.

| File | Purpose | New? |
| ---- | ------- | ---- |
| `accounts/models.py` | `User`, `Organization`, `OrganizationSettings`, `OrganizationMember`, `Role`, `Permission`, `UserRole`, `OneTimeToken`, `PasswordHistory`, `LoginHistory`. | New |
| `accounts/managers.py` | `TenantScopedQuerySet.visible_to(user)` — automatic org scoping. | New |
| `accounts/mixins.py` | `TenantScopedModel` abstract base for every business entity. | New |
| `accounts/permissions.py` | DRF classes: `IsOrganizationMember`, `HasPermission("...")`, `HasRole("...")`, `IsSelf`, `IsOwner`, `IsManagerOfEmployee`, `OrganizationObjectPermission`, `IsOrganizationAdmin`. | New |
| `accounts/middleware.py` | `OrganizationMiddleware` — resolves `request.organization` from header or primary membership. | New |
| `accounts/services/rbac.py` | Effective permission / role resolution. | New |
| `accounts/services/lockout.py` | Failed-login counter + temporary lock. | New |
| `accounts/services/tokens.py` | Hashed one-time tokens for verify / reset / invite. | New |
| `accounts/serializers.py` | Register / login / verify / reset / me (`MeSerializer` mirrors frontend contract). | New |
| `accounts/views.py` | Endpoints: login, refresh, logout, me, register, verify-email, resend, forgot, reset, change-password. | New |
| `accounts/urls.py` | Include under `path("api/auth/", include("accounts.urls"))`. | New |
| `audit/models.py` | `AuditEvent` — actor + org + action + target + metadata. | New |
| `audit/services.py` | `log_event(...)` helper. | New |
| `core/settings_security.py` | JWT, DRF, throttling, password validators, security headers, CORS — merge into your settings. | New |
| `core/seeds/roles.py` | Idempotent seeder for permissions + system roles (employee / manager / hr / payroll / finance / recruiter / org_admin / super_admin). | New |

### Dependencies

```
djangorestframework
djangorestframework-simplejwt
django-cors-headers
```

Add `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS` and run `python manage.py migrate` — refresh-token rotation + blacklist rely on it.

### Migration order

Because `AUTH_USER_MODEL = "accounts.User"` is set for the first time, this must be done on a **fresh database** OR through a data migration if you already have users. See Django's docs on switching user models mid-project.

1. Set `AUTH_USER_MODEL = "accounts.User"` in settings **before** any migration.
2. `python manage.py makemigrations accounts audit`
3. `python manage.py migrate`
4. Seed the role catalogue: `python manage.py shell -c "from core.seeds.roles import seed_system_roles; seed_system_roles()"`

---

## PART 12/13 — Backend gaps vs. the existing frontend

Based on the mock/service audit already documented in `INTEGRATION.md`, the following are still missing on the backend. This scaffold does not implement them; each is a follow-up endpoint/model:

### Missing endpoints
- `GET /api/leave/balances/` — computed per-type balance (`total / used / pending`).
- Attendance filter by `from_date` / `to_date` on `/api/attendance/punches/` (frontend passes `days=30` and today gets fudged as `page_size`).
- HR admin surfaces: teams, locations, requisitions, candidates, interviews, offers, onboarding, resignations, performance cycles, promotions, salary bands, shifts, policies, BGV, contracts, grievances, disciplinary, recognition, surveys, training, skill matrix, succession, HR approvals, activity feed.
- Payroll analytics: stats, runs, trend, department cost, salary bands, activity, alerts, calendar.
- HR dashboard aggregations: stats, headcount trend, department distribution, hiring funnel, onboarding tasks, approval queue, HR activity, org chart.
- System Administration: KPIs, service status, activity, access requests, security alerts, AI insights, API usage, login activity, licenses, device compliance.

### Missing serializer/response fields
- `DocumentItem` — spec ships `{id, name}`; frontend needs `category, size, uploaded, expiresOn, status, uploadedBy`.
- `/api/auth/me` — response was unspecified. This scaffold's `MeSerializer` fills it with the frontend contract; delete any older placeholder view.

### Missing request fields
- `EmployeeSkill` POST expects `skillId, level, endorsed`; the frontend must **not** send `name`.

### Naming mismatches (mappers already handle)
- Backend is snake_case throughout; frontend is camelCase. `src/lib/api/mappers.ts` already bridges both directions — no frontend changes needed if new backend fields follow the snake_case convention.

---

## Security posture summary

- **JWT** access (15 min) + refresh (7 days), rotation + blacklist on refresh.
- **Login** rate-limited (10/min per IP), account lockout after 5 failures for 30 min, login history recorded.
- **Passwords**: min 12 chars, Django validators, last-5 no-reuse enforced on reset.
- **Enumeration-safe** forgot-password and resend-verification (204 always).
- **Multi-tenancy**: every request carries `request.organization`; every tenant model FKs Organization and uses `.visible_to(user)` — no manual filtering per view.
- **RBAC**: string-coded permissions bundled into roles, roles assigned per-org — no hardcoded role checks in application code.
- **Object-level** permissions via `IsSelf`, `IsOwner`, `IsManagerOfEmployee`, `OrganizationObjectPermission`.
- **Serializer-level** field hiding: extend `MeSerializer` pattern — check `request.user`/`request.organization` in a `to_representation` override and pop `salary`, `bank_account`, `national_id`, `internal_notes` unless the caller has the right permission.
- **Audit log** for privileged actions via `audit.services.log_event`.
- **Headers**: HSTS, XFO=DENY, referrer policy, secure cookies, SSL redirect (production).
