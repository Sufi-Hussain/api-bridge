# Edit Profile UI — Full Implementation Plan (Connected End-to-End)

This document plans the connection of the existing **"Edit profile" button** (currently a dead UI) in `/_app/profile/personal` to the backend, database, and frontend service layer. It's structured as a **teaching plan** — each step has an educational "Why this exists in this project" section.

---

## 1. Repository Research (what exists today)

### 1.1 Database Models (Django ORM) — `/backend/apps/ess/models.py`

The "Employee Profile" is **NOT a single table**. It's a normalized graph of **7 related tables**:

| Model | Relation to `Employee` | Editable by ESS user? |
|---|---|---|
| **`Employee`** (L44-L81) | Root record (1:1 with `accounts.User`) | ✅ Yes — 11 editable fields (line 97-109 of views.py allowlist) |
| **`Address`** (L84-L93) | `Employee.address` — OneToOne | ✅ Yes (user's home address) |
| **`Employment`** (L96-L145) | `Employee.employment` — OneToOne | ❌ **Read-only in ESS** (edited by HR only: job title, dept, manager, salary, etc.) |
| **`EmergencyContact`** (L148-L156) | `Employee.emergency_contacts` — ForeignKey (many) | ✅ Yes CRUD |
| **`FamilyMember`** (L159-L167) | `Employee.family` — ForeignKey (many) | ✅ Yes CRUD |
| **`Education`** (L170-L179) | `Employee.education` — ForeignKey (many) | ✅ Yes CRUD |
| **`Experience`** (L182-L191) | `Employee.experience` — ForeignKey (many) | ✅ Yes CRUD |
| **`BankAccount`** (L194-L207) | `Employee.bank` — OneToOne | ✅ Yes (in Payroll tab, but useful now for understanding pattern) |
| **`Skill`** / **`EmployeeSkill`** (L210-L225) | `Employee.skills` — through EmployeeSkill | ✅ Yes CRUD |

**Key insight for the developer**: Django's thin "fat services / thin views" pattern means **no write logic belongs in views.py**. All PATCH/POST/PUT data flows through `services.py` (write) and `selectors.py` (read). You can see this pattern already on line 10-14 of `ess/services.py` with `update_employee()`.

### 1.2 Backend API — already partially wired!

**URLs** (`ess/urls.py` line 23-26):
```
GET/PATCH  /api/ess/profile             ← ProfileView  (already exists! ✅)
CRUD       /api/ess/emergency-contacts/ ← EmergencyContactViewSet (already exists! ✅)
CRUD       /api/ess/family/             ← FamilyViewSet (already exists! ✅)
CRUD       /api/ess/education/          ← EducationViewSet (already exists! ✅)
CRUD       /api/ess/experience/         ← ExperienceViewSet (already exists! ✅)
CRUD       /api/ess/skills/             ← SkillViewSet (already exists! ✅)
```

**What's MISSING in backend (only 2 things!)**:
1. No `Address` update endpoint (OneToOne). `ProfileView.patch()` allowlist at line 97-109 only covers the top-level Employee fields.
2. No `BankAccount` update endpoint (OneToOne). But this is planned for a separate Payroll feature — scope it as optional here.

### 1.3 Serializers (`ess/serializers.py`)
- `EmployeeProfileSerializer` (L117-L154) is the **complete nested profile read shape** — matches the frontend `EmployeeProfile` TypeScript interface exactly (this is the "API contract").
- Write serializers exist per-submodel: `AddressSerializer`, `EmergencyContactSerializer`, `FamilyMemberSerializer`, `EducationSerializer`, `ExperienceSerializer`, `EmployeeSkillSerializer`. All are correct & ready.

### 1.4 Frontend: The Edit Profile UI (dead button at line 47)
- File: `src/routes/_app.profile.personal.tsx`
- Button on line 47: `<Button>Edit profile</Button>` — **no onClick**.
- Page uses the excellent pattern: `Tabs` with 5 sections (Personal/Employment/Family & Emergency/Education & Experience/Skills).
- **Note lines 67, 71, 110, 121**: Four `Row`s are COMMENTED OUT — these are UI crashes waiting to happen when `p.address`, `p.employment.location`, etc., are `undefined` for employees whose DB records don't have the related row yet. We'll uncomment these *after* adding a selector guarantee.
- Also: `p.employment.manager.name` on line 124 **will crash** if manager is `null` (new hire with no manager yet) — need optional chaining.
- Profile completion percentage (line 39): `const completion = 82` hardcoded! We'll tie this to the backend `dashboardService.getProfileStatus()`.

### 1.5 Frontend Service Layer (`src/services/ess.ts`)
Line 50-52 (already exists, we saw it earlier):
```ts
async function updateProfile(body: Partial<EmployeeProfile>) {
  if (USE_MOCKS) return mock.updateProfile(body);
  return camelizeKeys(await apiPatch<any>("/api/ess/profile/", snakeizeKeys(body)));
}
```
But: this only patches the **top-level Employee** fields. It doesn't handle the nested `Address` (which PATCH `/profile` can't save yet), or the CRUD for related records.

So the FE service needs:
- `updateProfile()` — keeps working for the 11 Employee fields
- **NEW**: `updateAddress(address)` → new backend endpoint (or expand /profile to accept nested)
- **NEW**: 4 generic CRUD helpers backed by the existing ViewSets: `emergencyApi`, `familyApi`, `educationApi`, `experienceApi`, `skillsApi` — we can use the same `crud()` factory pattern already in `ess.ts` at lines 115-127 for education + emergency.

### 1.6 Overall Architecture Picture
```
┌────────────────────────────────────────────────────────────┐
│  EditModal / Drawer  (react-hook-form + zod schema)        │
│     Input: user types new mobile / address / family row    │
│                    │                                       │
│                    ▼                                       │
│  essService.updateProfile / updateAddress /                │
│  familyApi.create() / emergencyApi.remove()                │
│                    │                                       │
│                    ▼                                       │
│  lib/api/client.ts  axios instance                         │
│  (JWT attach, snakeize, camelize, 401 retry)               │
│                    │                                       │
│                    ▼                                       │
│  GET / PATCH /api/ess/profile                              │
│  CRUD /api/ess/family/, /api/ess/emergency-contacts/, etc. │
│                    │                                       │
│                    ▼                                       │
│  ProfileView.patch() → services.update_employee()          │
│  OwnedViewSet CRUD → sub-serializers                       │
│                    │                                       │
│                    ▼                                       │
│  Employee, Address, Employment, FamilyMember, etc. tables  │
│  (Postgres, all scoped by organization FK)                 │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Files and Modules to Change

| # | File | Expected Change |
|---|---|---|
| **1 (Backend, Required)** | `backend/apps/ess/views.py` | Expand `ProfileView.patch()` to also accept nested `address` dict and upsert `Employee.address` OneToOne. Add two small `@transaction.atomic` helpers in services.py. |
| **2 (Backend, Required)** | `backend/apps/ess/services.py` | Add `update_address(emp, data)`, `update_bank(emp, data)` — OneToOne-safe UPSERT pattern (create if not exists, else update). |
| **3 (Backend, Required)** | `backend/apps/ess/serializers.py` | Already has AddressSerializer. No change needed, but we will double-check the `fields` list. |
| **4 (Backend, Optional/Good)** | `backend/apps/ess/selectors.py` | Make `get_employee_for_user()` guarantee that `.address`, `.bank`, `.employment` **always exist** by creating empty OneToOne rows on first read for users that don't have them yet (call `select_related` result → if null → save empty row → return refreshed query). Eliminates all 4 commented-out Rows on the frontend and the line 124 crash. |
| **5 (FE Service)** | `src/services/ess.ts` | Add (already stubbed, needs to export + wire correctly): `updateAddress(address)`, also add `familyApi`, `emergencyApi`, `educationApi`, `experienceApi`, `skillsApi` to service surface so modal dialogs can call them. |
| **6 (FE Types)** | `src/services/ess.ts` types | Ensure `Address`, `EmergencyContact`, etc., `Partial<>` interfaces exist for form state. |
| **7 (FE UI)** | `src/routes/_app.profile.personal.tsx` | Main work. Implement: (a) Edit button onClick that opens **Sheet** / **Dialog** (or inline edit-mode); (b) 5-tabbed edit form matching read-only tabs; (c) Save button PATCHes to backend; (d) On success → refresh `p` state and return to read-only view; (e) Uncomment lines 67, 71, 110, 121 now that selector guarantees them; (f) Fix line 124 with optional chaining; (g) Tie `completion` to `dashboardService.getProfileStatus()` (or a local computation) instead of hardcoded 82. |
| **8 (FE UI)** | `src/routes/_app.profile.personal.tsx` — Family/Emergency tabs | Wire "Add" buttons (lines 133 & 149 currently dead `<Button>`) to small Add Emergency / Add Family dialogs. |
| **9 (FE UI)** | `src/routes/_app.profile.personal.tsx` — Education/Experience/Skills tabs | Same treatment for list sections — either small Add/Edit/Delete action buttons or an "Edit mode" toggle. |

---

## 3. Implementation Steps (Dependency Order)

### Step 1: Backend — Expand `ProfileView.patch()` to accept nested `address`
**Why**: Currently `/api/ess/profile/` PATCH only touches 11 Employee fields. Users need to edit their *home address* too. Since this is OneToOne, either create a separate Address endpoint or expand `/profile/`. We'll expand `/profile/` to accept `address` as a nested dict (simplest UX: 1 save call for the whole personal info sheet).

**What to code**:
1. In `services.py` → Add `update_address(emp: Employee, data: dict)` (atomic `.address` or `.address = Address.objects.create(employee=emp)` pattern).
2. In `views.py` → `ProfileView.patch()` → after extracting the Employee allowlist, ALSO pop `"address"` from `request.data`, call `update_address(emp, address_data)` if present.
3. Same for `"bank"` (optional, Payroll tab).

### Step 2: Backend — Zero-null safety in `get_employee_for_user()`
**Why**: The frontend has **4 currently-commented Rows** because `p.address.line1` threw `Cannot read 'line1' of undefined` for employees without an Address row. Also line 124 (`p.employment.manager.name`) will crash on no-manager employees.

**What to code**:
1. In `selectors.py` → after the `filter(user=user).first()` returns `emp`, check `if emp and not hasattr(emp, 'address') or emp.address_id is None` → create empty `Address(employee=emp, line1="", ...)` and save. Same for `.bank` (if missing → empty BankAccount), same for `.employment` (should never be missing but guard anyway).
2. **Return the refreshed employee from the DB** so `select_related` fields are populated → `return get_employee_for_user(user)` recursive / or refetch with `get_employee_for_user(user)` only if a row was created, else return emp). Alternative: use `get_or_create` + always return fresh via new `refresh_from_db()`.

### Step 3: Backend — Quick smoke test of endpoints
**Why**: Catch validation issues *before* writing the frontend modal.

**Run in shell**:
```bash
curl -XPATCH http://localhost:8000/api/ess/profile/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"mobile":"+1 555-1234", "address":{"line1":"123 Main St","city":"Austin","state":"TX","country":"US","postal":"78701"}}'
```
Expect → 200 OK with `EmployeeProfileSerializer.data` including the new address.

### Step 4: Frontend — Service layer (ess.ts)
**Why**: The "Edit profile" modal dialog must call functions that exist, not inline axios (violates the project's service-layer pattern).

**What to code**:
1. Add named function `updateAddress(address)` → `apiPatch("/api/ess/profile/", { address: snakeizeKeys(address) })` → return camelizeKeys.
2. Export all the already-coded `educationApi`, `emergencyApi` etc. on the `essService` surface (check if `familyApi` exists; if not, add using `crud()` pattern at lines 115-127).
3. Ensure `updateProfile()` snakeizes → already does; just confirm typing.

### Step 5: Frontend UI — Rewrite ProfilePage() into a **2-mode component** (Read / Edit)
**Why**: Current UI is **READ-ONLY** with a dead "Edit profile" button. Cleanest UX in this codebase is a 2-mode pattern (Edit toggle) OR a `<Sheet>` slide-in drawer (the project already has `<Sheet>` shadcn/ui installed, used by mobile sidebar).

**Recommended pattern for this project**: Sheet drawer (matches the "Meridian / HireChamps" modern UX of the codebase; keeps read-only view visible as context, no page reload).

**What to code** (inside `_app.profile.personal.tsx`):
1. State: `const [editOpen, setEditOpen] = useState(false);`
2. Button line 47 → onClick: `() => setEditOpen(true)`
3. Import the shadcn `<Sheet>`: `Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger`
4. Wrap the Edit-Button in `<SheetTrigger>` (or onClick opens it)
5. Render `<SheetContent side="right" className="sm:max-w-xl overflow-y-auto">`
6. Inside Sheet: **Replicate the 5 Tabs but each Row becomes form controls** (`Input`, `Select`, `DatePicker`, `Checkbox`). Use `react-hook-form` + `zod` (check `package.json` → this project probably already has them since it uses shadcn form) → else fall back to controlled `useState` for simplicity (but r-h-f + zod is project convention).
7. Initialize form values from `p` on open: `useEffect(() => { if (editOpen) reset(snapshot); }, [editOpen, p])`
8. Save handler: `onSubmit → Promise.all([essService.updateProfile(dirtyEmployeeFields), updateAddress(dirtyAddress)]) → then setP(await essService.getProfile()) → setEditOpen(false)`.
9. Error handling: catch any `ApiError` → alert or show under form.

### Step 6: Frontend UI — Uncomment the 4 safe Rows + fix optional-chain crash
**Why**: We did Step 2 (selector zero-null-safety), so those UI lines that were commented out to prevent crashes are now safe to turn on.

**What to code**:
1. **Line 67** `p.employment.jobTitle` + dept + employeeId — uncomment
2. **Line 71** `p.employment.location` — uncomment
3. **Line 110** Full address line — uncomment (now guaranteed by selector)
4. **Line 121** Employment location — uncomment
5. **Line 124** manager.name → ADD optional chaining: `p.employment.manager?.name ?? "Unassigned"` (manager CAN still be null even if employment exists, because a new hire may not have a manager yet; selector can't fix this by inventing a fake manager).
6. Profile completion line 39: `const completion = 82` → replace with real call, e.g. add state `const [profileStatus, setProfileStatus] = useState<{percentage: number; missing: string[]}>()`, load from `essService.getProfileStatus()` or dashboardService in an effect, then use `profileStatus?.percentage ?? 0`.

### Step 7: Frontend UI — Wire Family & Emergency "Add" Buttons
**Why**: Lines 133 and 149 have dead "Add" buttons. These are already CRUD-ready in the backend (`FamilyViewSet`, `EmergencyContactViewSet`).

**What to code**:
1. State for `addEmergencyOpen: boolean`, `addFamilyOpen: boolean`
2. Each "Add" button → opens small `<Dialog>` with a mini-form (3-5 fields: name, relation, phone, etc.)
3. On submit → `essService.emergencyApi.create(payload)` → then refresh `p = await essService.getProfile()`.
4. Add "Delete" (🗑️) icon per list item → confirm → `essService.emergencyApi.remove(id)` → refresh.
5. (Optional) Add "Edit" per list item → same Dialog in edit mode, `emergencyApi.update(id, patch)`.

### Step 8 (Optional, stretch): Education / Experience / Skills list edits
Same Step-7 pattern, but because Education has 5 fields, Experience has 6 fields, it's more code. Keep as "time-permitting" — Step 1-7 are the critical path for a working Edit Profile.

### Step 9: End-to-end Validation
(Full validation section, below.)

---

## 4. Dependencies and Considerations

- **shadcn/ui components used in this project**: Already installed — Sheet, Dialog, Input, Label, Select, Checkbox, Form, Button, DatePicker, Textarea. Verify by listing `src/components/ui/` before using new ones. If any are missing, `npx shadcn@latest add sheet dialog form date-picker select label input checkbox`.
- **react-hook-form & zod**: The project uses shadcn `<Form>` which wraps r-h-f + zod by convention. Check by imports in other pages using forms (login page?).
- **Snakeize/Camelize**: Every axios payload goes through `snakeizeKeys(payload)` in service layer before POST/PATCH, and responses via `camelizeKeys`. **Do NOT** send `firstName` keys in raw JSON to Django — it will reject unknown keys or ignore them. Always use the adapters.
- **401 auto-refresh**: Provided by `lib/api/client.ts` interceptor (already built). Just call `essService.*`, don't worry about auth tokens.
- **Weekend/date parsing**: Django DateField wants `"YYYY-MM-DD"` ISO strings. Use `date.toISOString().slice(0, 10)` or zod's `z.coerce.date().transform(d => d.toISOString().slice(0,10))`.
- **OneToOne create-or-update (UPSERT)**: For `Address` and `BankAccount` — use `Address.objects.update_or_create(employee=emp, defaults=data)` in the service, **not** `setattr + save` (that pattern fails when the row doesn't exist yet, and `employee.address = None` gives AttributeError sometimes because Django reverse OneToOne is weird if never created). Always `update_or_create` for OneToOne records.
- **Employee field allowlist** (views.py line 97-109): If we want to let employees edit additional fields (e.g. `preferred_name`), **add them here** or the PATCH silently drops them (line 110 `{k:v for k,v in data.items() if k in allowed}`). Current allowlist is correct.

---

## 5. Validation Plan

1. **Django check** (`python manage.py check`) — 0 issues.
2. **Python compile** (`py_compile`) — ess/views.py, ess/services.py, ess/selectors.py all pass.
3. **Backend curl PATCH test with address dict** (from Step 3) → 200 OK, response has new address nested.
4. **Frontend compile/types** (`npx tsc --noEmit` or `npm run check` / `npm run build`) — 0 TypeScript errors.
5. **Browser manual test**:
   - Login as employee → Navigate to `/profile/personal`
   - Previously-commented rows (67, 71, 110, 121) now render, no console errors
   - Line 124 manager area: If no manager, shows "Unassigned" (no crash)
   - Click "Edit profile": Sheet opens with prefilled current values
   - Change mobile + address line1 → Save → Sheet closes, read-only view shows *new* values
   - Refresh page: Changes persisted (confirm via DB or backend shell query)
   - Family tab: Click Add → fill → submit → new member appears in list
   - Family tab: Delete → confirm → disappears
   - Profile completion %: matches profileStatus, no longer hardcoded 82

---

## 6. Risks & Handling

| # | Risk | Mitigation |
|---|---|---|
| 1 | Existing employee records have no `Address` / `BankAccount` rows → frontend crashes on `p.address.line1` | Step 2: `get_employee_for_user()` selector does **create-empty-then-refresh**; guarantees all OneToOne rows exist. |
| 2 | `p.employment.manager.name` crashes when manager FK is NULL | Step 6: optional chain `manager?.name ?? "Unassigned"` + selector fallback for manager.name.manager_id. |
| 3 | User submits invalid date format (e.g. `September 5`) → Django DateField 400 | Client-side zod/date-picker coerces to ISO YYYY-MM-DD before snakeize. |
| 4 | User tries to edit `salary_base` or `job_title` (HR-only fields) → gets "silent ignore" because allowlist drops them | Good! Allowlist in views.py is the security layer. But to be helpful in the UX, don't render those fields as editable inputs — show them as `<Input disabled>` with a tooltip "Contact HR to change". |
| 5 | Form modal sheet has 5 tabs, long, user loses data → session reload / crash | `onSubmit` catches error, Sheet stays open with errors showing. On success only, close. If navigating away, BrowserUnsavedChanges warning (optional, stretch). |
| 6 | Profile photo upload button (line 58-60, Camera icon) — currently dead. | Out of scope; requires Media/Storage backend. Leave as UI-only with aria-label, add a tooltip: "Photo upload coming soon". |

---

## 7. Teaching Takeaways (per-layer philosophy)

To **learn how this project works**, focus on these patterns the previous developer enforces:

1. **"Python backends own the write logic"** — Every PATCH through `services.py` with `@transaction.atomic`; `views.py` only does URL dispatch, permissions, and `return Response(serializer.data)`.
2. **"Single source of truth — ONE TypeScript interface per entity"** — `EmployeeProfile` in ess.ts types **matches** `EmployeeProfileSerializer.fields` 1:1. If you add a field to one, add to the other.
3. **"Naming is the contract via camel↔snake mappers"** — Backend uses `first_name` (Python convention), frontend uses `firstName` (TS convention). The service layer (`snakeizeKeys` / `camelizeKeys`) is the bridge. Never let either side leak into the other.
4. **"Forever-memo is a footgun; prefer short TTL or re-fetch on write"** — We fixed this exact bug in dashboard TTL cache earlier. In Edit Profile: **always** re-fetch the full profile after a successful write (`setP(await essService.getProfile())`) instead of optimistic local updates — data race bugs come from partial updates (e.g. address PATCH returns updated EmployeeProfile but you only updated the address key locally).
5. **"Null-safety closer to the DB = better"** — Step 2 (selector creates empty OneToOne rows) is a "policy" decision (every employee always has an Address row). Putting it in the selector means **every** consumer of `get_employee_for_user()` benefits (dashboard, directory, payroll, etc.). Fix it once at the source instead of sprinkling `p?.address?.line1` guards across 10 frontend components.

That's the entire plan. Review it, approve, and we'll code Step 1 → 9 with running commentary at each step so you fully understand how each layer wires together.
