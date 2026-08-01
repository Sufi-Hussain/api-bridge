// Payroll / Compensation / Benefits / Time mock service.
// All figures are realistic enterprise dummy data for UI demonstrations.

export interface PayrollStats {
  totalCost: number;
  monthlyCost: number;
  processedEmployees: number;
  totalEmployees: number;
  pendingApprovals: number;
  pendingRevisions: number;
  pendingBonuses: number;
  complianceScore: number;
  attendanceRate: number;
  onLeaveToday: number;
  overtimeHours: number;
  benefitEnrollment: number;
  reimbursementBacklog: number;
  loansOutstanding: number;
}

export interface PayrollRun {
  id: string;
  period: string;
  runDate: string;
  employees: number;
  gross: number;
  net: number;
  status: "processing" | "approved" | "paid" | "locked" | "draft";
}

export interface PayrollTrend {
  month: string;
  gross: number;
  net: number;
  tax: number;
}

export interface DepartmentCost {
  name: string;
  cost: number;
  headcount: number;
}

export interface SalaryBand {
  band: string;
  count: number;
}

export interface PayrollActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  category: "run" | "approval" | "revision" | "bonus" | "compliance";
}

export interface PayrollAlert {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  detail: string;
}

export interface CalendarEvent {
  id: string;
  label: string;
  date: string;
  kind: "cutoff" | "run" | "payout" | "filing";
}

function delay<T>(v: T, ms = 120): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export const payrollService = {
  getStats: () =>
    delay<PayrollStats>({
      totalCost: 24_680_500,
      monthlyCost: 2_056_708,
      processedEmployees: 1218,
      totalEmployees: 1284,
      pendingApprovals: 14,
      pendingRevisions: 9,
      pendingBonuses: 6,
      complianceScore: 96,
      attendanceRate: 94.2,
      onLeaveToday: 43,
      overtimeHours: 1284,
      benefitEnrollment: 87,
      reimbursementBacklog: 38,
      loansOutstanding: 412_300,
    }),

  getRuns: () =>
    delay<PayrollRun[]>([
      { id: "PR-2026-07", period: "Jul 2026", runDate: "2026-07-25", employees: 1284, gross: 2_140_800, net: 1_612_400, status: "processing" },
      { id: "PR-2026-06", period: "Jun 2026", runDate: "2026-06-25", employees: 1272, gross: 2_098_200, net: 1_582_300, status: "paid" },
      { id: "PR-2026-05", period: "May 2026", runDate: "2026-05-25", employees: 1265, gross: 2_072_400, net: 1_563_800, status: "paid" },
      { id: "PR-2026-04", period: "Apr 2026", runDate: "2026-04-25", employees: 1258, gross: 2_054_900, net: 1_551_400, status: "locked" },
      { id: "PR-OFF-24", period: "Bonus · Q2", runDate: "2026-06-30", employees: 210, gross: 486_200, net: 372_800, status: "approved" },
    ]),

  getTrend: () =>
    delay<PayrollTrend[]>([
      { month: "Feb", gross: 1_942_000, net: 1_468_000, tax: 320_000 },
      { month: "Mar", gross: 1_988_000, net: 1_492_000, tax: 336_000 },
      { month: "Apr", gross: 2_054_900, net: 1_551_400, tax: 348_000 },
      { month: "May", gross: 2_072_400, net: 1_563_800, tax: 352_100 },
      { month: "Jun", gross: 2_098_200, net: 1_582_300, tax: 358_900 },
      { month: "Jul", gross: 2_140_800, net: 1_612_400, tax: 368_200 },
    ]),

  getDepartmentCost: () =>
    delay<DepartmentCost[]>([
      { name: "Engineering", cost: 812_400, headcount: 384 },
      { name: "Product", cost: 268_500, headcount: 96 },
      { name: "Sales", cost: 342_900, headcount: 148 },
      { name: "Marketing", cost: 184_600, headcount: 72 },
      { name: "Customer Success", cost: 196_800, headcount: 128 },
      { name: "Operations", cost: 132_400, headcount: 118 },
      { name: "Finance", cost: 84_200, headcount: 42 },
      { name: "People", cost: 34_908, headcount: 22 },
    ]),

  getSalaryDistribution: () =>
    delay<SalaryBand[]>([
      { band: "<50k", count: 148 },
      { band: "50–80k", count: 322 },
      { band: "80–120k", count: 408 },
      { band: "120–180k", count: 268 },
      { band: "180–250k", count: 96 },
      { band: "250k+", count: 42 },
    ]),

  getActivities: () =>
    delay<PayrollActivity[]>([
      { id: "a1", actor: "Priya Menon", action: "approved", target: "Jul run · Engineering", time: "12m", category: "approval" },
      { id: "a2", actor: "Auto-run", action: "initiated", target: "Jul 2026 payroll", time: "1h", category: "run" },
      { id: "a3", actor: "Marcus Wei", action: "revised salary for", target: "Ana K. (+8.5%)", time: "3h", category: "revision" },
      { id: "a4", actor: "Compliance bot", action: "flagged filing due", target: "ESI · 15 Aug", time: "5h", category: "compliance" },
      { id: "a5", actor: "Rita Kaur", action: "approved bonus for", target: "Q2 Sales team (24)", time: "7h", category: "bonus" },
      { id: "a6", actor: "Auto-run", action: "locked payroll", target: "Apr 2026", time: "1d", category: "run" },
    ]),

  getAlerts: () =>
    delay<PayrollAlert[]>([
      { id: "al1", title: "Provident Fund challan due", severity: "high", detail: "Statutory PF payment due in 3 days for July cycle." },
      { id: "al2", title: "9 salary revisions unapproved", severity: "medium", detail: "Revisions from performance cycle awaiting HRBP sign-off." },
      { id: "al3", title: "38 reimbursements > 14 days", severity: "medium", detail: "Employee claims exceeding SLA in Finance queue." },
      { id: "al4", title: "Time-off spike · Ops", severity: "low", detail: "Operations has 12% team on leave next week." },
    ]),

  getCalendar: () =>
    delay<CalendarEvent[]>([
      { id: "c1", label: "Timesheet cutoff", date: "Jul 22", kind: "cutoff" },
      { id: "c2", label: "Payroll run · Jul", date: "Jul 25", kind: "run" },
      { id: "c3", label: "Salary payout", date: "Jul 30", kind: "payout" },
      { id: "c4", label: "ESI filing", date: "Aug 15", kind: "filing" },
      { id: "c5", label: "PF challan", date: "Aug 15", kind: "filing" },
      { id: "c6", label: "TDS deposit", date: "Aug 07", kind: "filing" },
    ]),
};
