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

const USE_MOCKS = (import.meta as any)?.env?.VITE_USE_MOCKS === "true";

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
