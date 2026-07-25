// HR dashboard aggregations (headcount trends, hiring funnel, etc.).
// No matching backend endpoints — delegate to the mock as-is so pages
// that depend on `hrService` keep functioning.

import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import { hrService as mock } from "./_mocks/hr-basic.mock";

const USE_MOCKS = (import.meta as any)?.env?.VITE_USE_MOCKS === "true";

export const hrService = {
  ...mock,
  // Employees + Departments do have backend endpoints — override those.
  async getEmployees() {
    if (USE_MOCKS) return mock.getEmployees();
    const raw = await apiGet<any>("/api/hr/employees/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
  async getDepartments() {
    if (USE_MOCKS) return mock.getDepartments();
    const raw = await apiGet<any>("/api/hr/departments/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
};

export * from "./_mocks/hr-basic.mock";
