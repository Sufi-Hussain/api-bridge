// Re-export of the untouched mock services. The real service files under
// src/services/ delegate to these for endpoints that the Django backend
// does not yet expose. Deleting this folder is safe once every function
// in the parent services has a real implementation.

export { mockService } from "./dashboard.mock";
export { essService as essMock, MY_PROFILE, DIRECTORY, MY_TEAM } from "./ess.mock";
export * as hrMocks from "./hr.mock";
export { hrService as hrBasicMock } from "./hr-basic.mock";
export { payrollService as payrollMock } from "./payroll.mock";
export * as adminMock from "./admin.mock";
