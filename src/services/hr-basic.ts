// HR dashboard aggregations (headcount trends, hiring funnel, etc.).
// No matching backend endpoints — delegate to the mock as-is so pages
// that depend on `hrService` keep functioning.

import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import { hrService as mock } from "./_mocks/hr-basic.mock";

export const hrService = {
  ...mock,
  // Employees + Departments do have backend endpoints — override those.
  async getEmployees() {
    const raw = await apiGet<any>("/api/hr/employees/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
  async getDepartments() {
    const raw = await apiGet<any>("/api/hr/departments/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
};

export * from "./_mocks/hr-basic.mock";
