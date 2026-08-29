# Employee Lifecycle Status

## Existing functionality
- Employee, organization, membership, roles, and permissions: `backend/accounts/models.py`, `backend/apps/ess/models.py`, `backend/apps/common/permissions.py`
- Recruitment offers and onboarding screens/services: `backend/apps/hr/`, `src/routes/_app.hr.recruitment.offers.tsx`, `src/routes/_app.hr.onboarding.index.tsx`, `src/services/hr.ts`
- Documents, assets, benefits, payroll, leave, notifications, approvals, and audit: `backend/apps/{documents,assets,benefits,payroll,leave,notifications}/`, `backend/audit/`

## Implemented
- Existing organization-scoped employee and HR domain models reviewed.
- Existing onboarding/offboarding frontend entry points and service contracts reviewed.
- Added organization-scoped lifecycle records, checklist items, approvals, and asset actions: `backend/apps/lifecycle/`
- Added guarded transitions, audit events, employee activation, exit status, and access-revocation timestamps.
- Connected onboarding/offboarding/task screens to the real lifecycle API: `src/services/hr.ts` and lifecycle routes.
- Added generated migration and deterministic lifecycle seed scenarios.

## Pending
- Database-backed integration tests and live migration execution require PostgreSQL at `127.0.0.1:5432`.
- Existing recruitment offer records still need a domain backend before automatic offer acceptance can create lifecycle records.
- Existing asset/benefit/payroll modules remain separate integrations; lifecycle records expose the workflow hooks without duplicating them.

## Workflow status
`ONBOARDING → ACTIVE → OFFBOARDING → SEPARATED`: implemented with guarded API transitions, checklists, audit logging, and real frontend reads/writes.
