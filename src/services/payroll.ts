// Payroll module. Only /api/payroll/payslips/ exists in the backend.
// All other analytics/summary methods delegate to the mock.

import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import { payrollService as mock } from "./_mocks/payroll.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const payrollService = {
  ...mock,
  async getPayslips() {
    if (USE_MOCKS) return (mock as any).getPayslips?.() ?? [];
    const raw = await apiGet<any>("/api/payroll/payslips/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
};

export * from "./_mocks/payroll.mock";
