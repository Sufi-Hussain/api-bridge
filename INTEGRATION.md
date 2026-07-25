# HRMS Frontend ↔ Django Backend Integration

This project contains a **service + API scaffold** ready to drop into the
existing TanStack Start frontend. The public shape of every service export
(function names, arguments, return types) matches the original mock files
verbatim, so UI code, React Query hooks, and route loaders should not need
any changes.

## Layout

```
src/
├─ lib/api/
│   ├─ client.ts        Axios instance, JWT interceptors, 401 refresh flow
│   ├─ auth.ts          login / logout / me / refresh + token lifecycle
│   ├─ tokens.ts        localStorage-backed JWT store
│   ├─ mappers.ts       snake_case ↔ camelCase, pagination unwrap helpers
│   ├─ errors.ts        ApiError + Axios/DRF error normalizer
│   └─ index.ts         barrel
├─ services/
│   ├─ ess.ts           Employee Self-Service (largest surface, mostly wired)
│   ├─ hr.ts            HR domain (employees + departments wired)
│   ├─ hr-basic.ts      HR dashboard aggregations
│   ├─ payroll.ts       Payroll (payslips wired)
│   ├─ dashboard.ts     Employee dashboard (attendance/payslips/notifications/holidays wired)
│   ├─ admin.ts         System admin (100% mock — no backend yet)
│   ├─ _mocks/          Original mock files, kept verbatim as fallback
│   └─ index.ts         barrel
└─ types/index.ts       Shared User + Paginated<T> types
```

## Environment

Add to `.env` (see `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8000
# VITE_USE_MOCKS=true        # optional: force full mock mode for offline UI work
```

## Auth flow

- `authService.login({ username, password })` → POSTs `/api/auth/login`, saves
  the JWT pair in `localStorage` under `hrms.access` / `hrms.refresh`.
- Every subsequent request automatically carries `Authorization: Bearer …`.
- On any 401 the client attempts a single-flight refresh via
  `/api/auth/refresh`. On failure it clears the store and calls the
  `authService.onUnauthorized(handler)` callback so the app can redirect
  to the sign-in route.
- `authService.me()` maps the (unspecified) `/api/auth/me` payload to the
  frontend `User` shape.

## Response / request mapping

Every backend field uses `snake_case`; the frontend uses `camelCase`. All
services run responses through `camelizeKeys` and outgoing bodies through
`snakeizeKeys`. Pagination (`{ count, next, previous, results }`) is
unwrapped with `unwrapList` for list-returning mock signatures.

## File uploads

`apiUpload(url, formData)` sends `multipart/form-data`. Used by
`essService.uploadDocument(file, meta)` against `POST /api/documents/`.

---

## Migration summary

| Mock service / method | Django endpoint | Status |
|---|---|---|
| `authService.login` | `POST /api/auth/login` | ✅ wired |
| `authService.logout` | `POST /api/auth/logout` | ✅ wired |
| `authService.me` | `GET /api/auth/me` | ✅ wired (loose response) |
| `authService.refresh` | `POST /api/auth/refresh` | ✅ wired |
| `essService.getProfile` | `GET /api/ess/profile` | ✅ wired |
| `essService.updateProfile` | `PATCH /api/ess/profile` | ✅ wired |
| `essService.education.*` | `/api/ess/education/` (CRUD) | ✅ wired |
| `essService.emergencyContacts.*` | `/api/ess/emergency-contacts/` | ✅ wired |
| `essService.experience.*` | `/api/ess/experience/` | ✅ wired |
| `essService.family.*` | `/api/ess/family/` | ✅ wired |
| `essService.skills.*` | `/api/ess/skills/` | ✅ wired |
| `essService.getAttendance` | `GET /api/attendance/punches/` | ✅ wired |
| `essService.clockIn/clockOut` | `POST /api/attendance/punches/clock-{in,out}/` | ✅ wired |
| `essService.getTimesheets` + CRUD | `/api/attendance/timesheets/` | ✅ wired |
| `essService.getLeaveRequests` + CRUD | `/api/leave/requests/` | ✅ wired |
| `essService.getHolidays` | `GET /api/leave/holidays/` | ✅ wired |
| `essService.getPayslips` | `GET /api/payroll/payslips/` | ✅ wired |
| `essService.getNotifications` | `GET /api/notifications/` | ✅ wired |
| `essService.markNotificationRead` | `POST /api/notifications/{id}/read/` | ✅ wired |
| `essService.getDocuments` + upload/delete | `/api/documents/` | ✅ wired |
| `employeeService.list/get` (hr.ts) | `/api/hr/employees/` | ✅ wired |
| `departmentService.*` (hr.ts) | `/api/hr/departments/` | ✅ wired |
| `hrService.getEmployees/getDepartments` (hr-basic.ts) | same as above | ✅ wired |
| `payrollService.getPayslips` | `/api/payroll/payslips/` | ✅ wired |
| `mockService.getAttendanceThisMonth/getPayslips/getNotifications/getHolidays/getMe` | mapped to matching endpoints | ✅ wired |
| **All other mock methods** | *no backend endpoint* | ⏳ mock fallback |

### Mock-only surfaces (need backend work)

The following service areas remain on mock data because the OpenAPI spec has
no matching endpoint. Each one is a candidate for the next backend
milestone.

- **Employee Self-Service extras**: leave balances, benefits, expenses,
  assets, courses / certifications, goals & performance reviews,
  announcements, company events, help tickets, KB articles, travel
  requests, message threads, activity feed, sessions.
- **Payroll**: stats, runs, trend, department cost, salary bands,
  activity feed, alerts, calendar.
- **HR admin (`hr.ts`)**: teams, locations, requisitions & job openings,
  candidates, interviews, offers, onboarding, resignations, performance
  cycles, promotions, salary bands, shifts, policies, BGV, contracts,
  audit events, grievances, disciplinary, recognition, surveys,
  training, skill matrix, succession, HR approvals, activity feed.
- **HR dashboard (`hr-basic.ts`)**: stats, headcount trend, department
  distribution, hiring funnel, candidates list, onboarding tasks,
  approval queue, HR activity, org chart.
- **System Administration**: 100% mock — no admin endpoints exist yet
  (KPIs, service status, activity, access requests, security alerts,
  AI insights, API usage, login activity, licenses, device compliance).

---

## Endpoint mismatches / gaps

1. **`/api/auth/me` response is not defined in the spec.** The auth
   service camelizes whatever comes back and coerces it to the frontend
   `User` shape. Confirm the actual field names once the backend is
   documented and tighten the mapper.
2. **`DocumentItem` schema is a stub in the YAML** (only `id`, `name`).
   The frontend expects `category`, `size`, `uploaded`, `expiresOn`,
   `status`, `uploadedBy`. Missing fields will be `undefined`; UI code
   that relies on them will need graceful defaults or the backend needs
   to fill in the schema.
3. **Leave balances**: the frontend expects a computed per-type balance
   with `total / used / pending`. The backend exposes `LeaveType`
   (`annual_quota`) and `LeaveRequest` but no computed balance endpoint.
   Recommend adding `GET /api/leave/balances/`.
4. **Attendance filtering by date range**: the frontend passes a
   `days = 30` argument. The current implementation uses `page_size` as
   a stand-in — a proper `from_date` / `to_date` filter on
   `/api/attendance/punches/` would be cleaner.
5. **HR employees search**: `employeeService.list({ search, department, status, ... })`
   forwards its filters to `/api/hr/employees/` as snake_case query
   params. Confirm the exact filter names the backend supports (the
   spec doesn't list them beyond generic `search`/`ordering`).
6. **Skills**: backend `EmployeeSkill` uses `skill_id` (writeOnly) and
   returns `name` (readOnly). The `crud()` helper posts whatever the
   caller sends after snake-casing; UI code creating a skill must pass
   `{ skillId, level, endorsed }` and NOT `name`.
7. **Casing on nested writes**: the mapper walks arrays and plain
   objects but skips `File`/`Blob`/`Date`. If a mutation body ever
   nests structured JSON inside `FormData`, snake-case that JSON
   manually before appending.

---

## Assumptions

- Backend uses SimpleJWT (`access` + `refresh` tokens) — matches
  `TokenObtainPair` / `TokenRefresh` in the spec.
- DRF `PageNumberPagination` is the pagination default
  (`{ count, next, previous, results }`).
- `Authorization: Bearer <access>` is the accepted auth header.
- All list endpoints accept generic `search`, `ordering`, `page`,
  `page_size` query params (per the spec's shared parameters).
- The frontend's original camelCase contracts are the source of truth;
  the service layer bridges to snake_case, not the other way around.
- Mock fallback stays in `src/services/_mocks/` until the backend
  covers the missing surfaces — delete each file only after its
  service parent has zero references to it.
