import { apiGet, apiPost, apiPatch, camelizeKeys, snakeizeKeys, unwrapList } from "@/lib/api";
import type { TimesheetEntry } from "./ess";

export const timesheetsService = {
  async current(date: string, kind = "weekly") {
    const raw = await apiGet<any>("/api/timesheets/mine/current/", { params: { date, kind } });
    return camelizeKeys<any>(raw);
  },
  async list(params: Record<string, unknown> = {}): Promise<TimesheetEntry[]> {
    const raw = await apiGet<any>("/api/timesheets/mine/", { params: snakeizeKeys(params) });
    return unwrapList<TimesheetEntry>(raw, (row) => camelizeKeys<TimesheetEntry>(row));
  },
  async saveLines(id: string, lines: Array<Record<string, unknown>>) {
    const raw = await apiPost<any>(`/api/timesheets/mine/${id}/lines/`, { lines: snakeizeKeys(lines) });
    return camelizeKeys<any>(raw);
  },
  async update(id: string, data: Partial<TimesheetEntry>) {
    const raw = await apiPatch<any>(`/api/timesheets/mine/${id}/`, snakeizeKeys(data));
    return camelizeKeys<TimesheetEntry>(raw);
  },
  async submit(id: string, comment = "") {
    const raw = await apiPost<any>(`/api/timesheets/mine/${id}/submit/`, { comment });
    return camelizeKeys<any>(raw);
  },
  async comment(id: string, body: string) {
    const raw = await apiPost<any>(`/api/timesheets/mine/${id}/comments/`, { body });
    return camelizeKeys<any>(raw);
  },
  async myAnalytics(start: string, end: string) {
    const raw = await apiGet<any>("/api/timesheets/mine/analytics/", { params: { start, end } });
    return camelizeKeys<any>(raw);
  },
  async projects() {
    const raw = await apiGet<any>("/api/timesheets/projects/");
    return unwrapList<any>(raw, (row) => camelizeKeys<any>(row));
  },
  async summary(start: string, end: string) {
    return apiGet<Record<string, string | number>>("/api/attendance/timesheets/summary/", { params: { start, end } });
  },
};

export const timesheetApprovalsService = {
  async list(params: Record<string, unknown> = {}) {
    const raw = await apiGet<any>("/api/timesheets/approvals/", { params: snakeizeKeys(params) });
    return unwrapList<any>(raw, (row) => camelizeKeys<any>(row));
  },
  async pending() {
    const raw = await apiGet<any>("/api/timesheets/approvals/pending/");
    return unwrapList<any>(raw, (row) => camelizeKeys<any>(row));
  },
  async decide(id: string, decision: "approve" | "reject" | "return", comment = "") {
    const raw = await apiPost<any>(`/api/timesheets/approvals/${id}/decide/`, { decision, comment });
    return camelizeKeys<any>(raw);
  },
  async analytics(start: string, end: string) {
    const raw = await apiGet<any>("/api/timesheets/approvals/analytics/", { params: { start, end } });
    return camelizeKeys<any>(raw);
  },
  async compliance(date: string) {
    const raw = await apiGet<any>("/api/timesheets/approvals/compliance/", { params: { date } });
    return camelizeKeys<any>(raw);
  },
  async remind(date: string) {
    const raw = await apiPost<any>("/api/timesheets/approvals/remind/", { date });
    return camelizeKeys<any>(raw);
  },
};
