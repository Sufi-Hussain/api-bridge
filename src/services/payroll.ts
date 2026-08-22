// Payroll module. Only /api/payroll/payslips/ exists in the backend.
// All other analytics/summary methods delegate to the mock.

import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import type { Payslip } from "./_mocks/payroll.mock";

export const payrollService = {
  async getPayslips(): Promise<Payslip[]> {
    const raw = await apiGet<any>("/api/payroll/payslips/");
    return unwrapList<Payslip>(raw, (r) => camelizeKeys<Payslip>(r));
  },
};

export type { Payslip } from "./_mocks/payroll.mock";
