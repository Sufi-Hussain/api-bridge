// HR domain service. Employees + Departments are backend-backed;
// every other sub-service (recruitment, lifecycle, performance, comp,
// workforce, engagement, learning, analytics, approvals, activity) is
// proxied to the mock until Django exposes them.

import { apiGet, apiPost, apiPatch, apiDelete, camelizeKeys, snakeizeKeys, unwrapList } from "@/lib/api";
import type { Employee, Department } from "./_mocks/hr.mock";
import {
  employeeService as employeeMock,
  departmentService as departmentMock,
  teamService,
  locationService,
  recruitmentService,
  performanceService,
  compensationService,
  workforceService,
  leaveAdminService,
  attendanceAdminService,
  documentService,
  complianceService,
  relationsService,
  engagementService,
  learningService,
  analyticsService,
  approvalService,
  activityService,
} from "./_mocks/hr.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// ---- Employees -------------------------------------------------------------
export const employeeService = {
  ...employeeMock,
  async list(params: Record<string, unknown> = {}): Promise<Employee[]> {
    if (USE_MOCKS) return employeeMock.list();
    // Frontend filters like { search, department, status } map straight to
    // DRF query params. camelCase → snake_case for consistency.
    const raw = await apiGet<any>("/api/hr/employees/", { params: snakeizeKeys(params) });
    return unwrapList<Employee>(raw, (r) => camelizeKeys<Employee>(r));
  },
  async get(id: string): Promise<Employee | undefined> {
    if (USE_MOCKS) return employeeMock.get(id);
    const raw = await apiGet<any>(`/api/hr/employees/${id}/`);
    return camelizeKeys<Employee>(raw);
  },
};

// ---- Departments -----------------------------------------------------------
export const departmentService = {
  ...departmentMock,
  async list(): Promise<Department[]> {
    if (USE_MOCKS) return departmentMock.list();
    const raw = await apiGet<any>("/api/hr/departments/");
    return unwrapList<Department>(raw, (r) => camelizeKeys<Department>(r));
  },
  async get(id: string): Promise<Department> {
    const raw = await apiGet<any>(`/api/hr/departments/${id}/`);
    return camelizeKeys<Department>(raw);
  },
  async create(body: Partial<Department>): Promise<Department> {
    const raw = await apiPost<any>("/api/hr/departments/", snakeizeKeys(body));
    return camelizeKeys<Department>(raw);
  },
  async update(id: string, body: Partial<Department>): Promise<Department> {
    const raw = await apiPatch<any>(`/api/hr/departments/${id}/`, snakeizeKeys(body));
    return camelizeKeys<Department>(raw);
  },
  async remove(id: string): Promise<void> {
    await apiDelete(`/api/hr/departments/${id}/`);
  },
};

// ---- Compensation ----------------------------------------------------------
export const compensationApiService = {
  async bands() { const raw = await apiGet<any>("/api/compensation/bands/"); return unwrapList<any>(raw, (r) => camelizeKeys<any>(r)); },
  async promotions() { const raw = await apiGet<any>("/api/compensation/promotions/"); return unwrapList<any>(raw, (r) => camelizeKeys<any>(r)); },
  async revisions() { const raw = await apiGet<any>("/api/compensation/revisions/"); return unwrapList<any>(raw, (r) => camelizeKeys<any>(r)); },
  async incrementSummary() {
    const revisions = await this.revisions();
    const approved = revisions.filter((r: any) => r.status === "approved");
    const allocatedUsd = approved.reduce((sum: number, r: any) => sum + Number(r.newSalary ?? 0) - Number(r.previousSalary ?? 0), 0);
    const avgHikePct = approved.length ? approved.reduce((sum: number, r: any) => sum + Number(r.hikePct ?? 0), 0) / approved.length : 0;
    return { cycle: "Current compensation cycle", budgetUsd: allocatedUsd, allocatedUsd, avgHikePct, topPerformerPct: avgHikePct, byDept: [], trend: [] };
  },
};

// ---- Employee lifecycle ----------------------------------------------------
export const lifecycleApiService = {
  async records() { const raw = await apiGet<any>("/api/lifecycle/records/"); return unwrapList<any>(raw, (r) => camelizeKeys<any>(r)); },
  async create(body: Record<string, unknown>) { const raw = await apiPost<any>("/api/lifecycle/records/", snakeizeKeys(body)); return camelizeKeys<any>(raw); },
  async transition(id: string, target: string, fields: Record<string, unknown> = {}) { const raw = await apiPost<any>(`/api/lifecycle/records/${id}/transition/`, { target, ...snakeizeKeys(fields) }); return camelizeKeys<any>(raw); },
  async checklist(id: string) { const raw = await apiGet<any>(`/api/lifecycle/records/${id}/checklist/`); return unwrapList<any>(raw, (r) => camelizeKeys<any>(r)); },
  async updateChecklist(id: string, itemId: string, completed: boolean) { const raw = await apiPatch<any>(`/api/lifecycle/records/${id}/checklist/`, { id: itemId, completed }); return camelizeKeys<any>(raw); },
  async hires() { return (await this.records()).filter((r: any) => ["preboarding", "onboarding"].includes(r.status)).map((r: any) => ({ id: r.id, candidateName: r.employeeName, role: r.jobTitle, department: r.department, manager: r.manager, location: "", joinDate: r.joiningDate, progress: r.completion, tasksTotal: r.checklist?.length ?? 0, tasksDone: r.checklist?.filter((i: any) => i.completed).length ?? 0, status: r.status === "onboarding" ? "in_progress" : r.status, buddy: "—" })); },
  async resignations() { return (await this.records()).filter((r: any) => ["offboarding", "separated"].includes(r.status)).map((r: any) => ({ id: r.id, employeeId: r.employee, employeeName: r.employeeName, department: r.department, role: r.jobTitle, manager: r.manager, submittedAt: r.noticeDate, lastWorkingDay: r.lastWorkingDay, reason: r.exitReason, status: r.status === "offboarding" ? "hr_review" : "approved", clearanceProgress: r.completion, exitInterviewDone: false })); },
  async onboardingTasks() { const records = await this.records(); const items: any[] = []; for (const record of records.filter((r: any) => ["preboarding", "onboarding"].includes(r.status))) { const checklist = record.checklist ?? await this.checklist(String(record.id)); items.push(...checklist.filter((i: any) => i.phase === "onboarding").map((i: any) => ({ id: i.id, hireId: record.id, hireName: record.employeeName, task: i.title, category: "hr", owner: i.owner, dueDate: record.joiningDate, status: i.completed ? "done" : "todo" }))); } return items; },
  async onboardingStats() { const hires = await this.hires(); return { newHires: hires.length, inProgress: hires.filter((h: any) => h.status === "in_progress").length, delayed: 0, completed: 0, avgProgress: hires.length ? Math.round(hires.reduce((sum: number, h: any) => sum + h.progress, 0) / hires.length) : 0 }; },
};

// ---- Everything else: pass-through to mock (no backend yet) ----------------
export {
  teamService,
  locationService,
  recruitmentService,
  performanceService,
  compensationService,
  workforceService,
  leaveAdminService,
  attendanceAdminService,
  documentService,
  complianceService,
  relationsService,
  engagementService,
  learningService,
  analyticsService,
  approvalService,
  activityService,
};

// Types
export * from "./_mocks/hr.mock";
