// Authenticated employee dashboard API service.
import type { User } from "@/types";

export interface AttendanceDay { date: string; status: "present" | "absent" | "leave" | "holiday" | "weekend"; hours: number; }
export interface LeaveBalance { type: string; total: number; used: number; }
export interface Payslip { id: string; month: string; gross: number; net: number; status: "paid" | "processing"; }
export interface Announcement { id: string; title: string; body: string; author: string; date: string; tag: "company" | "team" | "policy"; }
export interface TaskItem { id: string; title: string; dueDate: string; priority: "low" | "medium" | "high"; status: "todo" | "in_progress" | "done"; }
export interface Holiday { date: string; name: string; type: "public" | "restricted"; }
export interface NotificationItem { id: string; title: string; description: string; time: string; read: boolean; category: "leave" | "payroll" | "system" | "team"; }
import { apiGet, camelizeKeys, unwrapList } from "@/lib/api";
import { authService } from "@/lib/api/auth";

export const dashboardService = {
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

