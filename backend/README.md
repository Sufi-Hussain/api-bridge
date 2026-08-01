# HRMS Backend (Django + DRF)

Enterprise Django backend replacing the mock services under `src/services/`.

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then edit DB credentials
createdb hrms                   # requires local PostgreSQL
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

## Endpoints

- `POST /api/auth/login` — obtain JWT access + refresh
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — blacklist refresh token
- `GET  /api/auth/me` — current user profile
- `GET/PATCH /api/ess/profile` — my employee profile (nested)
- `/api/ess/emergency-contacts/` — CRUD
- `/api/ess/family/` — CRUD
- `/api/ess/education/` — CRUD
- `/api/ess/experience/` — CRUD
- `/api/ess/skills/` — CRUD
- `/api/ess/documents/` — list/upload/delete
- `/api/attendance/punches/` — attendance history
- `/api/attendance/clock-in|clock-out` — actions
- `/api/leave/requests/` — CRUD
- `/api/leave/balances/` — read
- `/api/payroll/payslips/` — read
- `/api/hr/employees/` — HR directory
- `/api/notifications/` — inbox
- `/api/schema/` — OpenAPI schema
- `/api/docs/` — Swagger UI

## Architecture

Each app under `apps/` follows the same layout:

```
models.py       # ORM models (UUID PKs)
selectors.py    # read-only DB queries
services.py     # write-side business logic
serializers.py  # DRF (de)serialization, nested where useful
permissions.py  # role-based DRF permissions
views.py        # thin viewsets, delegate to services/selectors
urls.py         # router registration
admin.py        # Django admin registration
tests.py        # smoke tests
```

Views MUST NOT contain business logic; call `services` / `selectors` instead.
