// Employee Self-Service.
// Public surface matches the original mock (`essService`) verbatim so pages
// consuming it require no changes. Backend-backed methods hit Django;
// methods without a matching endpoint delegate to the bundled mock.

import {
  apiGet,
  apiPost,
  apiBlob,
  apiPatch,
  apiDelete,
  apiUpload,
  camelizeKeys,
  snakeizeKeys,
  unwrapList,
} from "@/lib/api";
import { essService as mock } from "./_mocks/ess.mock";
import type {
  EmployeeProfile,
  DocumentItem,
  AttendancePunch,
  TimesheetEntry,
  LeaveRequest,
  Payslip,
  NotificationItem,
} from "./_mocks/ess.mock";

const USE_MOCKS = false;
// const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// ---- ESS profile ------------------------------------------------------------
async function getProfile(): Promise<EmployeeProfile> {
  if (USE_MOCKS) return mock.getProfile();
  const raw = await apiGet<any>("/api/ess/profile");
  // The backend response is a flat DRF representation; camelize and merge
  // over the mock skeleton so any nested UI-only fields (skills endorsements,
  // family arrays, etc.) that the backend doesn't return still have a value.
  const base = await mock.getProfile();
  return { ...base, ...camelizeKeys<Partial<EmployeeProfile>>(raw) };
}

async function updateProfile(patch: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
  if (USE_MOCKS) return mock.getProfile();
  const raw = await apiPatch<any>("/api/ess/profile", snakeizeKeys(patch));
  const base = await mock.getProfile();
  return { ...base, ...camelizeKeys<Partial<EmployeeProfile>>(raw) };
}

// ---- Education / Emergency / Experience / Family / Skills -------------------
// Standard DRF list/create/patch/delete resources.
type Id = string;
function crud<TFront, TBack = any>(base: string) {
  return {
    list: async (): Promise<TFront[]> =>
      unwrapList<TFront>(await apiGet(base), (r) => camelizeKeys<TFront>(r)),
    create: async (body: Partial<TFront>): Promise<TFront> =>
      camelizeKeys<TFront>(await apiPost<TBack>(base, snakeizeKeys(body))),
    update: async (id: Id, body: Partial<TFront>): Promise<TFront> =>
      camelizeKeys<TFront>(await apiPatch<TBack>(`${base}${id}/`, snakeizeKeys(body))),
    remove: async (id: Id): Promise<void> => {
      await apiDelete(`${base}${id}/`);
    },
  };
}

const educationApi = crud("/api/ess/education/");
const emergencyApi = crud("/api/ess/emergency-contacts/");
const experienceApi = crud("/api/ess/experience/");
const familyApi = crud("/api/ess/family/");
const skillsApi = crud("/api/ess/skills/");

// ---- Attendance / Timesheets / Leave / Holidays / Payslips / Notifications --
async function getAttendance(days = 30): Promise<AttendancePunch[]> {
  if (USE_MOCKS) return mock.getAttendance(days);
  const raw = await apiGet<any>("/api/attendance/punches/", { params: { page_size: days } });
  return unwrapList<AttendancePunch>(raw, (r) => camelizeKeys<AttendancePunch>(r));
}

async function getTodayAttendance(): Promise<AttendancePunch | null> {
  const raw = await apiGet<any>("/api/attendance/punches/today/");
  if (!raw || Object.keys(raw).length === 0) return null;
  return camelizeKeys<AttendancePunch>(raw);
}

export interface AttendanceSummary {
  days: number;
  present: number;
  wfh: number;
  absent: number;
  leave: number;
  halfDay: number;
  lateArrivals: number;
  earlyDepartures: number;
  totalHours: string;
  avgHours: string;
  overtimeHours: string;
  attendanceRate: number;
}

async function getAttendanceSummary(days = 30): Promise<AttendanceSummary> {
  const raw = await apiGet<any>("/api/attendance/punches/summary/", { params: { days } });
  return camelizeKeys<AttendanceSummary>(raw);
}

async function clockIn(payload: Partial<AttendancePunch> = {}): Promise<AttendancePunch> {
  const raw = await apiPost<any>("/api/attendance/punches/clock-in/", snakeizeKeys(payload));
  return camelizeKeys<AttendancePunch>(raw);
}
async function clockOut(payload: Partial<AttendancePunch> = {}): Promise<AttendancePunch> {
  const raw = await apiPost<any>("/api/attendance/punches/clock-out/", snakeizeKeys(payload));
  return camelizeKeys<AttendancePunch>(raw);
}

async function getTimesheets(): Promise<TimesheetEntry[]> {
  if (USE_MOCKS) return mock.getTimesheets();
  const raw = await apiGet<any>("/api/attendance/timesheets/");
  return unwrapList<TimesheetEntry>(raw, (r) => camelizeKeys<TimesheetEntry>(r));
}
const timesheetsApi = crud<TimesheetEntry>("/api/attendance/timesheets/");

async function getLeaveRequests(): Promise<LeaveRequest[]> {
  if (USE_MOCKS) return mock.getLeaveRequests();
  const raw = await apiGet<any>("/api/leave/requests/");
  return unwrapList<LeaveRequest>(raw, (r) => camelizeKeys<LeaveRequest>(r));
}
const leaveApi = crud<LeaveRequest>("/api/leave/requests/");

async function getHolidays(): Promise<ReturnType<typeof mock.getHolidays> extends Promise<infer U> ? U : never> {
  if (USE_MOCKS) return mock.getHolidays();
  const raw = await apiGet<any>("/api/leave/holidays/");
  return unwrapList<any>(raw, (r) => camelizeKeys<any>(r));
}

async function getPayslips(): Promise<Payslip[]> {
  if (USE_MOCKS) return mock.getPayslips();
  const raw = await apiGet<any>("/api/payroll/payslips/");
  return unwrapList<Payslip>(raw, (r) => camelizeKeys<Payslip>(r));
}

async function downloadPayslip(id: string): Promise<Blob> {
  return apiBlob(`/api/payroll/payslips/${id}/pdf/`);
}

async function emailPayslip(id: string): Promise<void> {
  await apiPost(`/api/payroll/payslips/${id}/email/`);
}

async function getNotifications(): Promise<NotificationItem[]> {
  if (USE_MOCKS) {
    // ess.mock does not expose notifications directly on the essService;
    // fall through to a safe empty array so the caller doesn't blow up.
    return [];
  }
  const raw = await apiGet<any>("/api/notifications/");
  return unwrapList<NotificationItem>(raw, (r) => camelizeKeys<NotificationItem>(r));
}
async function markNotificationRead(id: string): Promise<void> {
  await apiPost(`/api/notifications/${id}/read/`);
}

// ---- Documents (multipart upload) ------------------------------------------
async function getDocuments(): Promise<DocumentItem[]> {
  if (USE_MOCKS) return mock.getDocuments();
  const raw = await apiGet<any>("/api/documents/");
  return unwrapList<DocumentItem>(raw, (r) => camelizeKeys<DocumentItem>(r));
}
async function uploadDocument(file: File, meta: Partial<DocumentItem> = {}): Promise<DocumentItem> {
  const form = new FormData();
  form.append("file", file);
  for (const [k, v] of Object.entries(snakeizeKeys<Record<string, unknown>>(meta) ?? {})) {
    if (v != null) form.append(k, String(v));
  }
  const raw = await apiUpload<any>("/api/documents/", form);
  return camelizeKeys<DocumentItem>(raw);
}
async function deleteDocument(id: string): Promise<void> {
  await apiDelete(`/api/documents/${id}/`);
}

// ---- Newly backend-backed ESS surfaces --------------------------------------
const list = async <T>(url: string): Promise<T[]> =>
  unwrapList<T>(await apiGet<any>(url), (r) => camelizeKeys<T>(r));

const getLeaveBalances = () => list<any>("/api/leave/requests/balances/");
const getBenefits = () => list<any>("/api/benefits/enrollments/");
const getExpenses = () => list<any>("/api/benefits/expenses/");
const getTravel = () => list<any>("/api/benefits/travel/");
const getLoans = () => list<any>("/api/benefits/loans/");
const getAssets = () => list<any>("/api/assets/assets/");
const getAssetRequests = () => list<any>("/api/assets/asset-requests/");
const getCourses = () => list<any>("/api/learning/courses/");
const getCertifications = () => list<any>("/api/learning/certifications/");
const getGoals = () => list<any>("/api/performance/goals/");
const getReviews = () => list<any>("/api/performance/reviews/");
const getDirectory = () => list<any>("/api/ess/directory/");

// ---- Public service surface -------------------------------------------------
// Matches the original mock so consuming pages do not change.
// Methods without a Django endpoint are proxied to the mock.
export const essService = {
  // Backend-backed
  getProfile,
  updateProfile,
  getDocuments,
  uploadDocument,
  deleteDocument,
  getAttendance,
  getTodayAttendance,
  getAttendanceSummary,
  clockIn,
  clockOut,
  getTimesheets,
  addTimesheet: timesheetsApi.create,
  updateTimesheet: timesheetsApi.update,
  deleteTimesheet: timesheetsApi.remove,
  getLeaveRequests,
  addLeaveRequest: leaveApi.create,
  updateLeaveRequest: leaveApi.update,
  cancelLeaveRequest: leaveApi.remove,
  getHolidays,
  getPayslips,
  downloadPayslip,
  emailPayslip,
  getNotifications,
  markNotificationRead,

  // Sub-resources (education/experience/family/emergency/skills)
  education: educationApi,
  emergencyContacts: emergencyApi,
  experience: experienceApi,
  family: familyApi,
  skills: skillsApi,

  // Backend-backed (benefits / expenses / assets / learning / performance)
  getLeaveBalances,
  getBenefits,
  getExpenses,
  getTravel,
  getLoans,
  getAssets,
  getAssetRequests,
  getCourses,
  getCertifications,
  getGoals,
  getReviews,
  getDirectory,

  // ---- Not yet in the Django spec: delegate to mock -------------------------
  getTickets: mock.getTickets,
  getActivity: mock.getActivity,
  getSessions: mock.getSessions,
  // Any other essService.* method still resolves via the star re-export below.
};

// Re-export the mock's remaining methods so existing UI imports keep working
// even for surfaces the backend does not implement.
export { MY_PROFILE, DIRECTORY, MY_TEAM } from "./_mocks/ess.mock";
export * from "./_mocks/ess.mock";
export { essService as _essMock } from "./_mocks/ess.mock";
