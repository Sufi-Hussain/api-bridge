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
  lifecycleService,
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

const USE_MOCKS = false;

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

// ---- Everything else: pass-through to mock (no backend yet) ----------------
export {
  teamService,
  locationService,
  recruitmentService,
  lifecycleService,
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
