// Employee dashboard service (the original `mockService`).
// Wires the six methods that have real endpoints; the rest stay on mock.

import type { User } from "@/types";
import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import { authService } from "@/lib/api/auth";
import { mockService as mock } from "./_mocks/dashboard.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const mockService = {
  ...mock,

  async getMe(): Promise<User> {
    if (USE_MOCKS) return mock.getMe();
    return authService.me();
  },

  async getAttendanceThisMonth() {
    if (USE_MOCKS) return mock.getAttendanceThisMonth();
    const raw = await apiGet<any>("/api/attendance/punches/", { params: { page_size: 62 } });
    return unwrapList<any>(raw, (r) => {
      const c = camelizeKeys<any>(r);
      return {
        date: c.date,
        status: c.status,
        hours: Number(c.workedHours ?? 0),
      };
    });
  },

  async getPayslips() {
    if (USE_MOCKS) return mock.getPayslips();
    const raw = await apiGet<any>("/api/payroll/payslips/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },

  async getNotifications() {
    if (USE_MOCKS) return mock.getNotifications();
    const raw = await apiGet<any>("/api/notifications/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },

  async getHolidays() {
    if (USE_MOCKS) return mock.getHolidays();
    const raw = await apiGet<any>("/api/leave/holidays/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
};

// Re-export types
export * from "./_mocks/dashboard.mock";
