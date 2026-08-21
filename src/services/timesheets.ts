import { apiGet, apiPost, apiPatch, camelizeKeys, snakeizeKeys, unwrapList } from "@/lib/api";
import type { TimesheetEntry } from "./ess";

export const timesheetsService = {
  async list(params: Record<string, unknown> = {}): Promise<TimesheetEntry[]> {
    const raw = await apiGet<any>("/api/attendance/timesheets/", { params: snakeizeKeys(params) });
    return unwrapList<TimesheetEntry>(raw, (row) => camelizeKeys<TimesheetEntry>(row));
  },
  async update(id: string, data: Partial<TimesheetEntry>) {
    const raw = await apiPatch<any>(`/api/attendance/timesheets/${id}/`, snakeizeKeys(data));
    return camelizeKeys<TimesheetEntry>(raw);
  },
  async submit(start: string, end: string) {
    return apiPost<{ submitted: number }>("/api/attendance/timesheets/submit/", { start, end });
  },
  async summary(start: string, end: string) {
    return apiGet<Record<string, string | number>>("/api/attendance/timesheets/summary/", { params: { start, end } });
  },
};
