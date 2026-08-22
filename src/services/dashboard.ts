// Employee dashboard service (the original `mockService`).
// Wires the six methods that have real endpoints; the rest stay on mock.

import type { User } from "@/types";
import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import { authService } from "@/lib/api/auth";

export const mockService = {
  async getLeaveBalances() {
    const raw = await apiGet<any>("/api/leave/balances/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },

  async getTasks() {
    const raw = await apiGet<any>("/api/tasks/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },

  async getAnnouncements() {
    const raw = await apiGet<any>("/api/notifications/", { params: { category: "company" } });
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },

  async getMe(): Promise<User> {
    return authService.me();
  },

  async getAttendanceThisMonth() {
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
    const raw = await apiGet<any>("/api/payroll/payslips/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },

  async getNotifications() {
    const raw = await apiGet<any>("/api/notifications/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },

  async getHolidays() {
    const raw = await apiGet<any>("/api/leave/holidays/");
    return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
  },
};

// Re-export types
export * from "./_mocks/dashboard.mock";
