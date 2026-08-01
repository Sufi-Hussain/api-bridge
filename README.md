# API Bridge

# Objective

I have two completed codebases:

1. A **TanStack Start (SSR)** frontend that currently uses **mock service files** (mock.ts/mock.js) as its data source.

2. A **Django + Django REST Framework** backend with a generated **OpenAPI/Swagger YAML specification**.

I am attaching:

- All frontend mock service files.

- The generated OpenAPI YAML from the Django backend.

Your task is to **replace the mock service layer with real API integrations** so that the frontend is fully powered by the Django backend.

The goal is to complete the integration with **minimal impact on the existing frontend architecture**.

---

# Critical Requirements

## DO NOT

- Do NOT redesign the application.

- Do NOT modify page layouts.

- Do NOT modify React components unless absolutely required.

- Do NOT change TanStack routes.

- Do NOT change business logic inside the pages.

- Do NOT change React Query usage unless necessary.

- Do NOT rename existing TypeScript models unless unavoidable.

- Do NOT rewrite the application.

## DO

- Replace every mock implementation with real HTTP requests.

- Keep the frontend behavior exactly the same.

- Preserve the current folder structure as much as possible.

- Make the service layer act as the adapter between the frontend and backend.

The UI should not know whether the data comes from mocks or from Django.

---

# Step 1 – Analyze Existing Mock Services

Inspect every attached mock service file.

Understand:

- exported service functions

- interfaces

- return types

- mutations

- filtering

- pagination

- sorting

- search

- data transformations

Document how every service currently behaves before replacing it.

---

# Step 2 – Analyze the Django OpenAPI Specification

Read the attached Swagger/OpenAPI YAML.

Identify:

- all available endpoints

- request bodies

- response schemas

- authentication

- pagination

- filtering

- ordering

- path parameters

- query parameters

- upload endpoints

Do not assume endpoint behavior.

Use the OpenAPI specification as the source of truth.

---

# Step 3 – Map Frontend Services to Backend APIs

For every mock service:

Determine the matching Django endpoint.

Examples:

Current:

getProfile()

↓

GET /api/ess/profile/

Current:

updateProfile()

↓

PATCH /api/ess/profile/

Current:

getEducation()

↓

GET /api/ess/education/

Current:

addEmergencyContact()

↓

POST /api/ess/emergency/

Every exported service function should be mapped to an API endpoint whenever possible.

---

# Step 4 – Create a Shared API Layer

If one does not already exist, create a reusable API client.

Example:

src/lib/api.ts

Configure:

- Axios

- Base URL

- Timeout

- JSON headers

- Request interceptors

- Response interceptors

- Authentication support

- Global error handling

Avoid duplicated request code.

---

# Step 5 – Preserve Existing Frontend Contracts

The frontend already expects specific object shapes.

If the backend response differs, DO NOT change the UI.

Instead, transform the backend response inside the service layer.

Example:

Backend:

{

    "first_name": "John",

    "last_name": "Smith"

}

Frontend expects:

{

    firstName: "John",

    lastName: "Smith"

}

Perform this transformation inside the service.

The frontend should continue receiving exactly the same structure it expects today.

---

# Step 6 – Request Mapping

When sending data back to Django:

Transform frontend objects into the backend schema.

Example:

Frontend:

firstName

Backend:

first_name

Map these differences inside the service layer.

The UI should remain unaware of backend naming conventions.

---

# Step 7 – React Query Compatibility

Keep existing React Query hooks working.

Do not rewrite query hooks unless required.

Replace only the underlying data-fetching functions.

Existing query keys should continue working.

---

# Step 8 – CRUD Support

Replace all mock CRUD operations with real API calls.

Support:

GET

POST

PUT

PATCH

DELETE

where available in the backend.

---

# Step 9 – Pagination

If backend pagination differs from the frontend,

adapt it inside the service layer.

Do not modify UI components.

Normalize pagination responses if necessary.

---

# Step 10 – Filtering and Sorting

Translate frontend filters into backend query parameters.

Examples:

search

department

status

manager

location

date ranges

ordering

If the parameter names differ,

perform the translation inside the service layer.

---

# Step 11 – Authentication

Read the authentication flow from the OpenAPI specification.

Implement:

- Login

- Logout

- Refresh token

- Current user

Configure request interceptors to automatically attach JWT access tokens.

Handle:

401 Unauthorized

Token refresh

Session expiration

Redirect to login when appropriate.

---

# Step 12 – File Uploads

Replace any mock upload functionality with real multipart/form-data requests.

Support profile images and document uploads where applicable.

---

# Step 13 – Error Handling

Normalize backend errors.

Do not expose raw Axios or Django errors directly to the UI.

Return errors in the format expected by the existing frontend.

---

# Step 14 – TypeScript

Keep existing interfaces whenever possible.

If backend responses differ,

create mapping functions instead of modifying components.

Only update interfaces if absolutely necessary.

---

# Step 15 – Code Quality

Follow existing project conventions.

Prefer:

- async/await

- reusable helpers

- small focused functions

- strong typing

- minimal duplication

---

# Step 16 – Validation

After replacing the mock services:

Verify that:

- Every page loads correctly.

- Existing React Query hooks continue to work.

- Forms submit correctly.

- CRUD operations work.

- Search works.

- Filters work.

- Sorting works.

- Pagination works.

- Authentication works.

- File uploads work.

The frontend should function exactly as before, except all data now comes from the Django backend.

---

# Deliverables

At the end of the migration:

1. Replace every mock service with a real API implementation.

2. Create a reusable API client.

3. Create any necessary response/request mapper utilities.

4. Add authentication utilities.

5. Update environment variables (API base URL, etc.).

6. List any endpoint mismatches between the frontend and backend.

7. List any missing backend endpoints required by the frontend.

8. List any assumptions made during the integration.

9. Provide a migration summary showing:

   - Which mock services were replaced.

   - Which API endpoints they map to.

   - Any remaining mock implementations (if any).

   - Any issues that require backend changes.

# Success Criteria

The project should run without relying on any mock data.

The TanStack frontend should communicate directly with the Django backend through the service layer, with no visible changes to the user interface or application behavior.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ad836df-723a-46c8-8a78-f50f73b3b767).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
