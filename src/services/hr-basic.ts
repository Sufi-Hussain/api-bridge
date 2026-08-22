// HR dashboard aggregations (headcount trends, hiring funnel, etc.).
// No matching backend endpoints — delegate to the mock as-is so pages
// that depend on `hrService` keep functioning.

import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import type { HrDashboardData } from "./_mocks/hr-basic.mock";

export const hrService = {
  async getEmployees() {
    const raw = await apiGet<any>("/api/hr/employees/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
  async getDepartments() {
    const raw = await apiGet<any>("/api/hr/departments/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
};

export type { HrDashboardData } from "./_mocks/hr-basic.mock";
