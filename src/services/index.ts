// Barrel export for the whole service layer. Import from `@/services`
// in the UI to keep call sites tidy.

export { authService } from "@/lib/api/auth";
export { essService } from "./ess";
export { employeeService, departmentService, teamService, locationService, recruitmentService, lifecycleService, performanceService, compensationService, workforceService, leaveAdminService, attendanceAdminService, documentService, complianceService, relationsService, engagementService, learningService, analyticsService, approvalService, activityService } from "./hr";
export { hrService } from "./hr-basic";
export { payrollService } from "./payroll";
export { mockService } from "./dashboard";
export * from "./admin";
