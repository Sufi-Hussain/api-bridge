// Shared frontend types referenced across services.
// The `User` type is consumed by the dashboard mock (`mock.ts`) and by the
// auth layer.  Keep this shape stable — the UI expects it verbatim.

export interface User {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  roles: string[];
  permissions: string[];
  organizationId: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
