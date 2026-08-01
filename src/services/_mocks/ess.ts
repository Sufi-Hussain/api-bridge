// Employee Self-Service mock service layer.
// Every page component should import from here — swap the implementation
// with real REST calls later without touching UI.

const delay = <T,>(v: T, ms = 200): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

// ────────────────────────────── Types ──────────────────────────────

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  dob: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  nationality: string;
  bloodGroup: string;
  personalEmail: string;
  workEmail: string;
  mobile: string;
  workPhone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postal: string;
  };
  employment: {
    jobTitle: string;
    department: string;
    grade: string;
    employmentType: "full-time" | "part-time" | "contract" | "intern";
    manager: { id: string; name: string; title: string };
    location: string;
    workMode: "on-site" | "hybrid" | "remote";
    joinDate: string;
    probationEnd?: string;
    tenure: string;
    costCenter: string;
    businessUnit: string;
  };
  emergency: {
    id: string;
    name: string;
    relation: string;
    phone: string;
    email?: string;
    primary: boolean;
  }[];
  family: {
    id: string;
    name: string;
    relation: string;
    dob: string;
    dependent: boolean;
    covered: boolean;
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    field: string;
    from: string;
    to: string;
    grade?: string;
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    from: string;
    to: string;
    location: string;
    summary: string;
  }[];
  bank: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bank: string;
    branch: string;
    type: "savings" | "current";
  };
  skills: { name: string; level: 1 | 2 | 3 | 4 | 5; endorsed: number }[];
}

export interface DocumentItem {
  id: string;
  name: string;
  category: "identity" | "employment" | "education" | "certificate" | "tax" | "medical";
  size: string;
  uploaded: string;
  expiresOn?: string;
  status: "verified" | "pending" | "expired" | "rejected";
  uploadedBy: string;
}

export interface AttendancePunch {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workedHours: number;
  breakMinutes: number;
  location: string;
  status: "present" | "absent" | "leave" | "holiday" | "weekend" | "wfh" | "half-day";
  shift: string;
}

export interface TimesheetEntry {
  id: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  billable: boolean;
  status: "draft" | "submitted" | "approved" | "rejected";
}

export interface LeaveRequest {
  id: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "approved" | "pending" | "rejected" | "cancelled";
  approver: string;
  appliedOn: string;
}

export interface Payslip {
  id: string;
  month: string;
  period: string;
  gross: number;
  net: number;
  deductions: number;
  tax: number;
  status: "paid" | "processing" | "released";
  paidOn?: string;
  earnings: { label: string; amount: number }[];
  deductionsBreakdown: { label: string; amount: number }[];
}

export interface Benefit {
  id: string;
  name: string;
  category: "health" | "insurance" | "wellness" | "retirement" | "perk";
  provider: string;
  coverage: string;
  status: "active" | "pending" | "expired";
  renewalDate: string;
  premium: number;
  employerContribution: number;
  claims: number;
  usage: number; // 0–100
}

export interface ExpenseClaim {
  id: string;
  title: string;
  category: "travel" | "food" | "office" | "medical" | "training" | "other";
  amount: number;
  currency: string;
  date: string;
  status: "draft" | "submitted" | "approved" | "reimbursed" | "rejected";
  approver: string;
  receiptCount: number;
  notes?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: "laptop" | "phone" | "monitor" | "accessory" | "software" | "other";
  serial: string;
  assignedOn: string;
  condition: "excellent" | "good" | "fair";
  warrantyEnd?: string;
  value: number;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  durationHours: number;
  rating: number;
  enrolled: boolean;
  progress: number;
  completedOn?: string;
  cover: string;
  mandatory: boolean;
  dueDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedOn: string;
  expiresOn?: string;
  credentialId: string;
  status: "active" | "expiring" | "expired";
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: "career" | "team" | "learning" | "personal";
  progress: number;
  status: "on-track" | "at-risk" | "behind" | "achieved";
  dueDate: string;
  weight: number;
  keyResults: { id: string; text: string; progress: number }[];
}

export interface PerformanceReview {
  id: string;
  cycle: string;
  reviewer: string;
  reviewerTitle: string;
  overallRating: number; // 0-5
  submittedOn: string;
  status: "self-review" | "manager-review" | "calibration" | "shared" | "acknowledged";
  strengths: string[];
  improvements: string[];
}

export interface DirectoryPerson {
  id: string;
  name: string;
  title: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  managerId?: string;
  timezone: string;
  status: "available" | "in-meeting" | "on-leave" | "offline";
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  authorTitle: string;
  date: string;
  category: "company" | "team" | "policy" | "celebration";
  reactions: number;
  comments: number;
  pinned?: boolean;
}

export interface CompanyEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "town-hall" | "training" | "celebration" | "holiday" | "team";
  attendees: number;
  rsvp: "yes" | "no" | "maybe" | "none";
}

export interface HelpTicket {
  id: string;
  subject: string;
  category: "IT" | "HR" | "Payroll" | "Facilities" | "Access";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "waiting" | "resolved" | "closed";
  assignee: string;
  createdOn: string;
  updatedOn: string;
  slaHours: number;
  messages: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  updatedOn: string;
  views: number;
  helpful: number;
  readMinutes: number;
}

export interface TravelRequest {
  id: string;
  destination: string;
  purpose: string;
  from: string;
  to: string;
  estimatedCost: number;
  status: "draft" | "submitted" | "approved" | "booked" | "rejected";
  approver: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: "leave" | "payroll" | "system" | "team" | "learning" | "helpdesk";
  href?: string;
}

export interface MessageThread {
  id: string;
  with: string;
  role: string;
  lastMessage: string;
  unread: number;
  time: string;
  online: boolean;
}

export interface ActivityEvent {
  id: string;
  time: string;
  type: "login" | "profile" | "leave" | "payroll" | "asset" | "learning" | "security";
  title: string;
  detail: string;
  ip?: string;
  device?: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

// ────────────────────────────── Fixtures ──────────────────────────────

export const MY_PROFILE: EmployeeProfile = {
  id: "usr_001",
  employeeId: "EMP-10428",
  firstName: "Aarav",
  lastName: "Sharma",
  preferredName: "Aarav",
  gender: "male",
  dob: "1993-08-14",
  maritalStatus: "married",
  nationality: "Indian",
  bloodGroup: "O+",
  personalEmail: "aarav.sharma@gmail.com",
  workEmail: "aarav.sharma@acme.com",
  mobile: "+91 98765 12340",
  workPhone: "+1 415 555 0132",
  address: {
    line1: "42 Cedar Lane",
    line2: "Apt 5B",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    postal: "560095",
  },
  employment: {
    jobTitle: "Senior Product Designer",
    department: "Design",
    grade: "L5",
    employmentType: "full-time",
    manager: { id: "usr_014", name: "Priya Iyer", title: "Design Director" },
    location: "Bengaluru HQ",
    workMode: "hybrid",
    joinDate: "2021-03-15",
    tenure: "4y 8m",
    costCenter: "CC-DES-001",
    businessUnit: "Product",
  },
  emergency: [
    { id: "ec1", name: "Meera Sharma", relation: "Spouse", phone: "+91 98765 88991", email: "meera@example.com", primary: true },
    { id: "ec2", name: "Rajesh Sharma", relation: "Father", phone: "+91 98720 33112", primary: false },
  ],
  family: [
    { id: "f1", name: "Meera Sharma", relation: "Spouse", dob: "1994-11-02", dependent: true, covered: true },
    { id: "f2", name: "Kabir Sharma", relation: "Son", dob: "2020-04-19", dependent: true, covered: true },
    { id: "f3", name: "Rajesh Sharma", relation: "Father", dob: "1962-06-30", dependent: true, covered: false },
  ],
  education: [
    { id: "e1", degree: "M.Des", institution: "IIT Bombay", field: "Interaction Design", from: "2016", to: "2018", grade: "8.6 / 10" },
    { id: "e2", degree: "B.Tech", institution: "NIT Trichy", field: "Computer Science", from: "2011", to: "2015", grade: "8.2 / 10" },
  ],
  experience: [
    { id: "x1", company: "Northwind Traders", role: "Product Designer", from: "2018-06", to: "2021-02", location: "Pune", summary: "Led design for the fulfillment platform serving 40+ warehouses." },
    { id: "x2", company: "Bright Studios", role: "UX Intern", from: "2015-07", to: "2016-05", location: "Bengaluru", summary: "Design systems and interaction prototypes." },
  ],
  bank: {
    accountName: "Aarav Sharma",
    accountNumber: "XXXXXX4432",
    ifsc: "HDFC0004421",
    bank: "HDFC Bank",
    branch: "Koramangala",
    type: "savings",
  },
  skills: [
    { name: "Figma", level: 5, endorsed: 42 },
    { name: "Design Systems", level: 5, endorsed: 38 },
    { name: "User Research", level: 4, endorsed: 24 },
    { name: "Prototyping", level: 4, endorsed: 22 },
    { name: "Motion Design", level: 3, endorsed: 15 },
    { name: "Accessibility", level: 4, endorsed: 19 },
  ],
};

const NAMES = [
  "Priya Iyer", "Nikhil Menon", "Ananya Rao", "Rohan Kapoor", "Isha Verma",
  "Kabir Malhotra", "Sara Ahmed", "David Chen", "Emma Wilson", "Liam Patel",
  "Nora Kim", "Olivia Brown", "Jake Turner", "Maya Fernandes", "Vikram Singh",
  "Zoya Sheikh", "Arjun Nair", "Ritika Bansal", "Devika Reddy", "Marcus Lee",
  "Sophia Martinez", "Ethan Wright", "Chloe Adams", "Yash Bhatt", "Divya Krishnan",
];
const TITLES = [
  "Design Director", "Engineering Manager", "Senior Engineer", "Product Manager",
  "Data Analyst", "Marketing Lead", "Sales Executive", "HR Business Partner",
  "Finance Analyst", "IT Support", "QA Engineer", "Design Lead",
];
const DEPTS = ["Design", "Engineering", "Product", "Marketing", "Sales", "HR", "Finance", "IT", "Operations"];
const LOCATIONS = ["Bengaluru HQ", "Mumbai", "New York", "London", "Singapore", "Remote"];

export const DIRECTORY: DirectoryPerson[] = NAMES.map((n, i) => ({
  id: `usr_${(i + 10).toString().padStart(3, "0")}`,
  name: n,
  title: TITLES[i % TITLES.length],
  department: DEPTS[i % DEPTS.length],
  location: LOCATIONS[i % LOCATIONS.length],
  email: `${n.toLowerCase().replace(/[^a-z]/g, ".")}@acme.com`,
  phone: `+91 98${(100000 + i * 137).toString().slice(0, 5)}`,
  managerId: i > 3 ? `usr_${(10 + (i % 4)).toString().padStart(3, "0")}` : undefined,
  timezone: ["Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Singapore"][i % 4],
  status: (["available", "in-meeting", "on-leave", "offline"] as const)[i % 4],
}));

const TEAM_IDS = ["usr_014", "usr_015", "usr_016", "usr_017", "usr_018", "usr_019"];
export const MY_TEAM = DIRECTORY.filter((p) => TEAM_IDS.includes(p.id));

// ────────────────────────────── Service ──────────────────────────────

function iso(date: Date) { return date.toISOString().slice(0, 10); }

function buildPunches(days: number): AttendancePunch[] {
  const out: AttendancePunch[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6;
    const holiday = i === 5;
    const leave = i === 12;
    const wfh = i % 6 === 2;
    const status: AttendancePunch["status"] = weekend
      ? "weekend" : holiday ? "holiday" : leave ? "leave" : wfh ? "wfh" : "present";
    const worked = status === "present" || status === "wfh" ? 8 + Math.round((Math.random() - 0.5) * 20) / 10 : 0;
    out.push({
      id: `att_${i}`,
      date: iso(d),
      clockIn: worked ? "09:32" : undefined,
      clockOut: worked ? "18:45" : undefined,
      workedHours: worked,
      breakMinutes: worked ? 45 : 0,
      location: wfh ? "Home Office" : "Bengaluru HQ",
      status,
      shift: "General (9:00–18:00)",
    });
  }
  return out;
}

export const essService = {
  getProfile: () => delay(MY_PROFILE),

  getDocuments: (): Promise<DocumentItem[]> => delay([
    { id: "d1", name: "Passport", category: "identity", size: "1.2 MB", uploaded: "2024-02-11", expiresOn: "2032-04-08", status: "verified", uploadedBy: "Self" },
    { id: "d2", name: "PAN Card", category: "identity", size: "480 KB", uploaded: "2021-03-18", status: "verified", uploadedBy: "Self" },
    { id: "d3", name: "Aadhaar", category: "identity", size: "620 KB", uploaded: "2021-03-18", status: "verified", uploadedBy: "Self" },
    { id: "d4", name: "Offer Letter", category: "employment", size: "220 KB", uploaded: "2021-03-01", status: "verified", uploadedBy: "HR" },
    { id: "d5", name: "Appointment Letter", category: "employment", size: "310 KB", uploaded: "2021-03-15", status: "verified", uploadedBy: "HR" },
    { id: "d6", name: "M.Des Degree", category: "education", size: "1.6 MB", uploaded: "2021-03-20", status: "verified", uploadedBy: "Self" },
    { id: "d7", name: "B.Tech Transcripts", category: "education", size: "980 KB", uploaded: "2021-03-20", status: "verified", uploadedBy: "Self" },
    { id: "d8", name: "AWS Solutions Architect", category: "certificate", size: "340 KB", uploaded: "2024-08-02", expiresOn: "2027-08-02", status: "verified", uploadedBy: "Self" },
    { id: "d9", name: "Form 16 · FY23-24", category: "tax", size: "180 KB", uploaded: "2024-06-14", status: "verified", uploadedBy: "Payroll" },
    { id: "d10", name: "Health Insurance Card", category: "medical", size: "220 KB", uploaded: "2025-01-04", expiresOn: "2026-01-03", status: "verified", uploadedBy: "HR" },
    { id: "d11", name: "COVID Vaccination", category: "medical", size: "160 KB", uploaded: "2023-11-20", status: "pending", uploadedBy: "Self" },
    { id: "d12", name: "Driving License", category: "identity", size: "540 KB", uploaded: "2019-06-10", expiresOn: "2025-06-09", status: "expired", uploadedBy: "Self" },
  ]),

  getAttendance: (days = 30) => delay(buildPunches(days)),

  getTimesheets: (): Promise<TimesheetEntry[]> => delay(
    Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return {
        id: `ts_${i}`,
        date: iso(d),
        project: ["Atlas Redesign", "Voyager Mobile", "Compass Analytics"][i % 3],
        task: ["Discovery", "Wireframes", "Prototyping", "Review", "Handoff"][i % 5],
        hours: 4 + (i % 5),
        billable: i % 3 !== 0,
        status: i < 3 ? "submitted" : i < 7 ? "approved" : "draft",
      };
    })
  ),

  getLeaveBalances: () => delay([
    { type: "Casual", total: 12, used: 4, pending: 1, color: "chart-1" },
    { type: "Sick", total: 10, used: 2, pending: 0, color: "chart-3" },
    { type: "Earned", total: 20, used: 6, pending: 2, color: "chart-2" },
    { type: "Comp Off", total: 4, used: 1, pending: 0, color: "chart-4" },
    { type: "Bereavement", total: 5, used: 0, pending: 0, color: "chart-5" },
  ]),

  getLeaveRequests: (): Promise<LeaveRequest[]> => delay([
    { id: "l1", type: "Earned", from: "2025-11-24", to: "2025-11-25", days: 2, reason: "Family function", status: "approved", approver: "Priya Iyer", appliedOn: "2025-11-05" },
    { id: "l2", type: "Sick", from: "2025-10-14", to: "2025-10-14", days: 1, reason: "Fever", status: "approved", approver: "Priya Iyer", appliedOn: "2025-10-14" },
    { id: "l3", type: "Casual", from: "2025-12-22", to: "2025-12-26", days: 5, reason: "Year-end break", status: "pending", approver: "Priya Iyer", appliedOn: "2025-11-18" },
    { id: "l4", type: "Comp Off", from: "2025-09-08", to: "2025-09-08", days: 1, reason: "Weekend work compensation", status: "approved", approver: "Priya Iyer", appliedOn: "2025-09-01" },
    { id: "l5", type: "Earned", from: "2025-08-11", to: "2025-08-13", days: 3, reason: "Personal", status: "rejected", approver: "Priya Iyer", appliedOn: "2025-07-30" },
  ]),

  getHolidays: () => delay([
    { date: "2025-12-25", name: "Christmas Day", type: "public", region: "Global" },
    { date: "2026-01-01", name: "New Year's Day", type: "public", region: "Global" },
    { date: "2026-01-26", name: "Republic Day", type: "public", region: "India" },
    { date: "2026-03-14", name: "Holi", type: "restricted", region: "India" },
    { date: "2026-05-01", name: "Labour Day", type: "public", region: "Global" },
    { date: "2026-08-15", name: "Independence Day", type: "public", region: "India" },
    { date: "2026-10-02", name: "Gandhi Jayanti", type: "public", region: "India" },
    { date: "2026-11-11", name: "Diwali", type: "public", region: "India" },
  ]),

  getPayslips: (): Promise<Payslip[]> => delay(
    ["November 2025", "October 2025", "September 2025", "August 2025", "July 2025", "June 2025", "May 2025", "April 2025"]
      .map((m, i) => {
        const gross = 245000 + i * 1200;
        const tax = Math.round(gross * 0.18);
        const deductions = Math.round(gross * 0.10);
        const net = gross - tax - deductions;
        return {
          id: `ps_${i}`,
          month: m,
          period: `${m.split(" ")[0]} 1 – ${m.split(" ")[0]} 30`,
          gross, net, tax, deductions,
          status: (i === 0 ? "processing" : "paid") as Payslip["status"],
          paidOn: i === 0 ? undefined : `${m.split(" ")[0]} 30, ${m.split(" ")[1]}`,
          earnings: [
            { label: "Basic", amount: Math.round(gross * 0.5) },
            { label: "HRA", amount: Math.round(gross * 0.2) },
            { label: "Special Allowance", amount: Math.round(gross * 0.18) },
            { label: "Bonus", amount: Math.round(gross * 0.08) },
            { label: "Other", amount: Math.round(gross * 0.04) },
          ],
          deductionsBreakdown: [
            { label: "Income Tax (TDS)", amount: tax },
            { label: "Provident Fund", amount: Math.round(gross * 0.06) },
            { label: "Professional Tax", amount: 200 },
            { label: "Health Insurance", amount: Math.round(gross * 0.02) },
          ],
        };
      })
  ),

  getBenefits: (): Promise<Benefit[]> => delay([
    { id: "b1", name: "Group Medical Insurance", category: "health", provider: "ICICI Lombard", coverage: "₹8L family floater", status: "active", renewalDate: "2026-04-01", premium: 24000, employerContribution: 100, claims: 2, usage: 34 },
    { id: "b2", name: "Term Life Insurance", category: "insurance", provider: "HDFC Life", coverage: "3× annual salary", status: "active", renewalDate: "2026-04-01", premium: 12000, employerContribution: 100, claims: 0, usage: 0 },
    { id: "b3", name: "Personal Accident Cover", category: "insurance", provider: "Bajaj Allianz", coverage: "₹25L", status: "active", renewalDate: "2026-04-01", premium: 4800, employerContribution: 100, claims: 0, usage: 0 },
    { id: "b4", name: "Wellness Allowance", category: "wellness", provider: "Meridian HR", coverage: "$600 / year", status: "active", renewalDate: "2026-01-01", premium: 0, employerContribution: 100, claims: 4, usage: 62 },
    { id: "b5", name: "Provident Fund", category: "retirement", provider: "EPFO", coverage: "12% match", status: "active", renewalDate: "—", premium: 0, employerContribution: 100, claims: 0, usage: 0 },
    { id: "b6", name: "NPS (Optional)", category: "retirement", provider: "HDFC Pension", coverage: "Up to 10% of salary", status: "pending", renewalDate: "—", premium: 0, employerContribution: 50, claims: 0, usage: 0 },
    { id: "b7", name: "Meal Card", category: "perk", provider: "Sodexo", coverage: "₹2,200 / month", status: "active", renewalDate: "—", premium: 0, employerContribution: 100, claims: 12, usage: 88 },
    { id: "b8", name: "Learning Stipend", category: "perk", provider: "Meridian HR", coverage: "$1,200 / year", status: "active", renewalDate: "2026-01-01", premium: 0, employerContribution: 100, claims: 3, usage: 45 },
  ]),

  getExpenses: (): Promise<ExpenseClaim[]> => delay([
    { id: "e1", title: "Client dinner — Northwind", category: "food", amount: 148.50, currency: "USD", date: "2025-11-14", status: "approved", approver: "Priya Iyer", receiptCount: 2 },
    { id: "e2", title: "Uber to airport", category: "travel", amount: 42.10, currency: "USD", date: "2025-11-12", status: "reimbursed", approver: "Priya Iyer", receiptCount: 1 },
    { id: "e3", title: "Figma team seat", category: "office", amount: 45, currency: "USD", date: "2025-11-01", status: "reimbursed", approver: "Finance", receiptCount: 1 },
    { id: "e4", title: "Physiotherapy session", category: "medical", amount: 90, currency: "USD", date: "2025-10-27", status: "reimbursed", approver: "Priya Iyer", receiptCount: 1 },
    { id: "e5", title: "React Summit 2025 ticket", category: "training", amount: 640, currency: "USD", date: "2025-10-21", status: "submitted", approver: "Priya Iyer", receiptCount: 1 },
    { id: "e6", title: "Home office monitor", category: "office", amount: 320, currency: "USD", date: "2025-10-10", status: "approved", approver: "IT", receiptCount: 1 },
    { id: "e7", title: "Coffee — team meetup", category: "food", amount: 28.75, currency: "USD", date: "2025-10-08", status: "reimbursed", approver: "Priya Iyer", receiptCount: 1 },
    { id: "e8", title: "Hotel · Mumbai offsite", category: "travel", amount: 412, currency: "USD", date: "2025-09-19", status: "reimbursed", approver: "Finance", receiptCount: 3 },
    { id: "e9", title: "Design conference draft", category: "training", amount: 900, currency: "USD", date: "2025-11-18", status: "draft", approver: "—", receiptCount: 0 },
  ]),

  getAssets: (): Promise<Asset[]> => delay([
    { id: "as1", name: "MacBook Pro 16\" M3 Max", category: "laptop", serial: "MPB-2024-4482", assignedOn: "2024-04-11", condition: "excellent", warrantyEnd: "2027-04-10", value: 3499 },
    { id: "as2", name: "iPhone 15 Pro", category: "phone", serial: "IP-15P-88112", assignedOn: "2023-11-02", condition: "good", warrantyEnd: "2025-11-01", value: 1099 },
    { id: "as3", name: "Dell UltraSharp 32\" 4K", category: "monitor", serial: "DL-U32-0071", assignedOn: "2024-04-11", condition: "excellent", warrantyEnd: "2027-04-10", value: 899 },
    { id: "as4", name: "Magic Keyboard", category: "accessory", serial: "MK-2024-9911", assignedOn: "2024-04-11", condition: "excellent", value: 129 },
    { id: "as5", name: "MX Master 3S", category: "accessory", serial: "MX-3S-4420", assignedOn: "2024-04-11", condition: "good", value: 99 },
    { id: "as6", name: "Adobe Creative Cloud", category: "software", serial: "AC-LIC-88221", assignedOn: "2021-03-16", condition: "excellent", value: 660 },
    { id: "as7", name: "Figma Organization Seat", category: "software", serial: "FIG-ORG-1042", assignedOn: "2021-03-16", condition: "excellent", value: 540 },
    { id: "as8", name: "Herman Miller Aeron", category: "other", serial: "HM-AER-2201", assignedOn: "2022-01-10", condition: "good", value: 1395 },
  ]),

  getCourses: (): Promise<Course[]> => delay([
    { id: "c1", title: "Advanced Design Systems", provider: "Meridian Academy", category: "Design", level: "advanced", durationHours: 8, rating: 4.8, enrolled: true, progress: 62, cover: "grad-1", mandatory: false },
    { id: "c2", title: "Inclusive Design Fundamentals", provider: "IDEO U", category: "Design", level: "intermediate", durationHours: 6, rating: 4.7, enrolled: true, progress: 100, completedOn: "2025-10-04", cover: "grad-2", mandatory: false },
    { id: "c3", title: "Information Security Awareness", provider: "Meridian IT", category: "Compliance", level: "beginner", durationHours: 1, rating: 4.4, enrolled: true, progress: 40, cover: "grad-3", mandatory: true, dueDate: "2025-12-01" },
    { id: "c4", title: "Anti-Harassment Training", provider: "People Team", category: "Compliance", level: "beginner", durationHours: 1, rating: 4.6, enrolled: true, progress: 100, completedOn: "2025-08-11", cover: "grad-4", mandatory: true },
    { id: "c5", title: "Storytelling for Designers", provider: "Coursera", category: "Design", level: "intermediate", durationHours: 5, rating: 4.5, enrolled: false, progress: 0, cover: "grad-5", mandatory: false },
    { id: "c6", title: "Prompt Engineering for Product Teams", provider: "Meridian Academy", category: "AI", level: "beginner", durationHours: 3, rating: 4.9, enrolled: true, progress: 22, cover: "grad-6", mandatory: false },
    { id: "c7", title: "Leadership Essentials", provider: "LinkedIn Learning", category: "Leadership", level: "intermediate", durationHours: 4, rating: 4.3, enrolled: false, progress: 0, cover: "grad-1", mandatory: false },
    { id: "c8", title: "Advanced Figma Techniques", provider: "Config", category: "Design", level: "advanced", durationHours: 3, rating: 4.8, enrolled: true, progress: 85, cover: "grad-2", mandatory: false },
  ]),

  getCertifications: (): Promise<Certification[]> => delay([
    { id: "ct1", name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", issuedOn: "2024-08-02", expiresOn: "2027-08-02", credentialId: "AWS-4482-9911", status: "active" },
    { id: "ct2", name: "NN/g UX Certification", issuer: "Nielsen Norman Group", issuedOn: "2022-05-14", credentialId: "NNG-88112", status: "active" },
    { id: "ct3", name: "Google UX Design Professional", issuer: "Google", issuedOn: "2021-11-22", credentialId: "GOOG-UX-2201", status: "active" },
    { id: "ct4", name: "Scrum Product Owner", issuer: "Scrum.org", issuedOn: "2020-03-04", expiresOn: "2026-03-04", credentialId: "PSPO-4420", status: "expiring" },
  ]),

  getGoals: (): Promise<Goal[]> => delay([
    {
      id: "g1", title: "Ship Atlas 2.0 design system", description: "Roll out the redesigned system to all product surfaces.",
      category: "team", progress: 72, status: "on-track", dueDate: "2025-12-31", weight: 30,
      keyResults: [
        { id: "kr1", text: "Publish v2 tokens & primitives", progress: 100 },
        { id: "kr2", text: "Migrate 40 product screens", progress: 68 },
        { id: "kr3", text: "Enable accessibility audit gates", progress: 50 },
      ],
    },
    {
      id: "g2", title: "Improve NPS to 62", description: "Ship targeted improvements based on Q3 research findings.",
      category: "team", progress: 48, status: "at-risk", dueDate: "2026-03-31", weight: 25,
      keyResults: [
        { id: "kr4", text: "Fix top 10 friction points", progress: 60 },
        { id: "kr5", text: "Ship onboarding v2", progress: 35 },
      ],
    },
    {
      id: "g3", title: "Grow to Staff Designer", description: "Personal growth aligned to L6 competencies.",
      category: "career", progress: 55, status: "on-track", dueDate: "2026-06-30", weight: 20,
      keyResults: [
        { id: "kr6", text: "Lead a cross-org initiative", progress: 70 },
        { id: "kr7", text: "Mentor 2 designers", progress: 100 },
        { id: "kr8", text: "Publish 4 external artifacts", progress: 25 },
      ],
    },
    {
      id: "g4", title: "Deepen AI/LLM design skills", description: "Complete curated learning path and ship one AI feature.",
      category: "learning", progress: 30, status: "behind", dueDate: "2026-02-28", weight: 15,
      keyResults: [
        { id: "kr9", text: "Finish Prompt Engineering course", progress: 22 },
        { id: "kr10", text: "Design LLM-powered feature", progress: 40 },
      ],
    },
    {
      id: "g5", title: "Wellness & focus routine", description: "Sustain healthy habits for the year.",
      category: "personal", progress: 82, status: "on-track", dueDate: "2025-12-31", weight: 10,
      keyResults: [{ id: "kr11", text: "3 workouts / week", progress: 85 }, { id: "kr12", text: "Meditation streak", progress: 78 }],
    },
  ]),

  getPerformanceReviews: (): Promise<PerformanceReview[]> => delay([
    { id: "pr1", cycle: "H2 2025 · Mid-year", reviewer: "Priya Iyer", reviewerTitle: "Design Director", overallRating: 4.4, submittedOn: "2025-07-18", status: "shared", strengths: ["Craft & taste", "Cross-functional partnership", "Mentorship"], improvements: ["Strategic communication upward", "Ship faster on ambiguous work"] },
    { id: "pr2", cycle: "H1 2025 · Annual", reviewer: "Priya Iyer", reviewerTitle: "Design Director", overallRating: 4.2, submittedOn: "2025-01-22", status: "acknowledged", strengths: ["Systems thinking", "Team enablement"], improvements: ["Storytelling to execs", "Prioritization"] },
    { id: "pr3", cycle: "H2 2024", reviewer: "Anand Krishnan", reviewerTitle: "VP Design", overallRating: 4.1, submittedOn: "2024-07-30", status: "acknowledged", strengths: ["Design quality", "Reliability"], improvements: ["Take on broader scope"] },
  ]),

  getDirectory: () => delay(DIRECTORY),
  getTeam: () => delay(MY_TEAM),

  getAnnouncements: (): Promise<Announcement[]> => delay([
    { id: "an1", title: "New wellness benefit rolling out", body: "Starting December, all employees can claim a $600 annual wellness allowance covering gym, mental-health, and nutrition.", author: "People Team", authorTitle: "Benefits", date: "2h ago", category: "company", reactions: 84, comments: 12, pinned: true },
    { id: "an2", title: "Q4 all-hands scheduled", body: "Join us on Friday at 4pm for the quarterly all-hands and product roadmap review.", author: "CEO Office", authorTitle: "Leadership", date: "Yesterday", category: "company", reactions: 41, comments: 5 },
    { id: "an3", title: "Updated travel & per-diem policy", body: "Please review the updated international travel and per-diem policy in the KB.", author: "Finance", authorTitle: "Policy", date: "3d ago", category: "policy", reactions: 12, comments: 3 },
    { id: "an4", title: "Welcome our new joiners! 🎉", body: "Say hello to 14 new joiners across Product, Engineering, and Sales.", author: "People Team", authorTitle: "HR", date: "4d ago", category: "celebration", reactions: 132, comments: 22 },
    { id: "an5", title: "Design team offsite recap", body: "Highlights, decisions and the six bets we're placing for H1.", author: "Priya Iyer", authorTitle: "Design Director", date: "1w ago", category: "team", reactions: 58, comments: 9 },
  ]),

  getEvents: (): Promise<CompanyEvent[]> => delay([
    { id: "ev1", title: "Q4 All-Hands", date: "2025-11-28", time: "4:00 PM", location: "HQ Auditorium + Zoom", type: "town-hall", attendees: 412, rsvp: "yes" },
    { id: "ev2", title: "Design Craft Workshop", date: "2025-11-25", time: "2:00 PM", location: "Studio 3", type: "training", attendees: 24, rsvp: "yes" },
    { id: "ev3", title: "Diwali Celebration", date: "2025-11-11", time: "6:00 PM", location: "Rooftop", type: "celebration", attendees: 180, rsvp: "yes" },
    { id: "ev4", title: "New Joiner Orientation", date: "2025-12-01", time: "10:00 AM", location: "Training Room A", type: "training", attendees: 14, rsvp: "none" },
    { id: "ev5", title: "Christmas Day (Holiday)", date: "2025-12-25", time: "All day", location: "—", type: "holiday", attendees: 0, rsvp: "none" },
    { id: "ev6", title: "Team Bowling Night", date: "2025-12-06", time: "7:30 PM", location: "Spin Alley", type: "team", attendees: 22, rsvp: "maybe" },
  ]),

  getTickets: (): Promise<HelpTicket[]> => delay([
    { id: "HD-2418", subject: "MacBook keyboard replacement", category: "IT", priority: "medium", status: "in-progress", assignee: "IT Helpdesk", createdOn: "2025-11-18", updatedOn: "2 hours ago", slaHours: 48, messages: 4 },
    { id: "HD-2402", subject: "Payslip PDF not opening", category: "Payroll", priority: "low", status: "resolved", assignee: "Payroll", createdOn: "2025-11-14", updatedOn: "3 days ago", slaHours: 24, messages: 6 },
    { id: "HD-2391", subject: "Access to Compass analytics", category: "Access", priority: "medium", status: "waiting", assignee: "IAM Team", createdOn: "2025-11-12", updatedOn: "1 day ago", slaHours: 24, messages: 3 },
    { id: "HD-2377", subject: "Update address in records", category: "HR", priority: "low", status: "resolved", assignee: "HR Ops", createdOn: "2025-11-05", updatedOn: "1 week ago", slaHours: 72, messages: 5 },
    { id: "HD-2365", subject: "Meeting room booking issue", category: "Facilities", priority: "low", status: "closed", assignee: "Admin", createdOn: "2025-10-30", updatedOn: "2 weeks ago", slaHours: 24, messages: 2 },
    { id: "HD-2350", subject: "Urgent: laptop won't boot", category: "IT", priority: "urgent", status: "resolved", assignee: "IT Helpdesk", createdOn: "2025-10-22", updatedOn: "1 month ago", slaHours: 4, messages: 12 },
  ]),

  getKnowledge: (): Promise<KnowledgeArticle[]> => delay([
    { id: "k1", title: "How do I apply for leave?", category: "Leave", summary: "Step-by-step guide to submitting a leave request and understanding approval SLAs.", updatedOn: "2 weeks ago", views: 2418, helpful: 412, readMinutes: 3 },
    { id: "k2", title: "Understanding your payslip", category: "Payroll", summary: "Breakdown of earnings, deductions and how taxes are calculated on your monthly salary.", updatedOn: "1 month ago", views: 3892, helpful: 641, readMinutes: 5 },
    { id: "k3", title: "Enrolling in benefits", category: "Benefits", summary: "Annual enrollment window, dependents, and how to make mid-year changes.", updatedOn: "3 weeks ago", views: 1780, helpful: 244, readMinutes: 4 },
    { id: "k4", title: "Setting up 2FA on your account", category: "Security", summary: "Protect your account with an authenticator app or hardware key.", updatedOn: "2 months ago", views: 1112, helpful: 198, readMinutes: 4 },
    { id: "k5", title: "Reimbursement policy", category: "Expenses", summary: "What's eligible, submission deadlines, and receipt requirements.", updatedOn: "5 days ago", views: 981, helpful: 142, readMinutes: 6 },
    { id: "k6", title: "Requesting equipment", category: "IT", summary: "How to request laptops, monitors, or accessories and expected turnaround.", updatedOn: "1 month ago", views: 764, helpful: 121, readMinutes: 3 },
    { id: "k7", title: "Performance review cycle", category: "Performance", summary: "Cycle timeline, self-review guidance, and 360 feedback etiquette.", updatedOn: "3 weeks ago", views: 902, helpful: 155, readMinutes: 7 },
    { id: "k8", title: "Working from abroad", category: "Policy", summary: "Rules and approvals required to work temporarily from another country.", updatedOn: "6 weeks ago", views: 622, helpful: 88, readMinutes: 5 },
  ]),

  getTravelRequests: (): Promise<TravelRequest[]> => delay([
    { id: "tr1", destination: "San Francisco, USA", purpose: "Config 2025 · design conference", from: "2026-05-06", to: "2026-05-10", estimatedCost: 2800, status: "submitted", approver: "Priya Iyer" },
    { id: "tr2", destination: "Mumbai, IN", purpose: "Client visit — Northwind", from: "2025-12-09", to: "2025-12-11", estimatedCost: 620, status: "approved", approver: "Priya Iyer" },
    { id: "tr3", destination: "Singapore", purpose: "APAC design summit", from: "2025-09-14", to: "2025-09-17", estimatedCost: 1900, status: "booked", approver: "Priya Iyer" },
  ]),

  getNotifications: (): Promise<NotificationItem[]> => delay([
    { id: "n1", title: "Leave approved", description: "Your leave for Nov 24–25 has been approved by Priya.", time: "5m", read: false, category: "leave", href: "/leave/history" },
    { id: "n2", title: "November payslip is processing", description: "Expected to be released by Nov 30.", time: "1h", read: false, category: "payroll", href: "/payroll/payslips" },
    { id: "n3", title: "Security training due Dec 1", description: "Complete the mandatory course to stay compliant.", time: "3h", read: false, category: "learning", href: "/learning/courses" },
    { id: "n4", title: "Ticket HD-2418 updated", description: "IT Helpdesk added a note to your ticket.", time: "6h", read: true, category: "helpdesk", href: "/helpdesk/tickets" },
    { id: "n5", title: "New device policy published", description: "Please review the updated acceptable-use policy.", time: "1d", read: true, category: "system" },
    { id: "n6", title: "Kickoff reminder", description: "Atlas project kickoff at 3pm today.", time: "1d", read: true, category: "team" },
    { id: "n7", title: "Kudos from Rohan Kapoor", description: "\"Great work on the design review yesterday!\"", time: "2d", read: true, category: "team" },
  ]),

  getMessages: (): Promise<MessageThread[]> => delay([
    { id: "m1", with: "Priya Iyer", role: "Design Director", lastMessage: "Great — let's talk about the mid-year review Friday.", unread: 2, time: "10m", online: true },
    { id: "m2", with: "IT Helpdesk", role: "Support", lastMessage: "Your replacement keyboard is arriving Wednesday.", unread: 1, time: "1h", online: true },
    { id: "m3", with: "People Team", role: "HR", lastMessage: "Your address change has been recorded.", unread: 0, time: "3h", online: false },
    { id: "m4", with: "Rohan Kapoor", role: "Product Manager", lastMessage: "Loved the new dashboard flow 👏", unread: 0, time: "Yesterday", online: false },
    { id: "m5", with: "Ananya Rao", role: "Engineer", lastMessage: "Handoff spec looks perfect, thanks.", unread: 0, time: "2d", online: false },
  ]),

  getActivity: (): Promise<ActivityEvent[]> => delay([
    { id: "ac1", time: "2 min ago", type: "login", title: "Signed in from MacBook Pro", detail: "Chrome · Bengaluru, IN", ip: "203.0.113.42", device: "MacBook Pro 16\"" },
    { id: "ac2", time: "1h ago", type: "leave", title: "Leave request approved", detail: "Nov 24–25 · Earned" },
    { id: "ac3", time: "3h ago", type: "payroll", title: "Viewed October payslip", detail: "PDF download" },
    { id: "ac4", time: "Yesterday", type: "profile", title: "Updated emergency contact", detail: "Added Rajesh Sharma" },
    { id: "ac5", time: "2d ago", type: "learning", title: "Completed course", detail: "Inclusive Design Fundamentals" },
    { id: "ac6", time: "3d ago", type: "asset", title: "Reported keyboard issue", detail: "Ticket HD-2418 raised" },
    { id: "ac7", time: "5d ago", type: "security", title: "Password changed", detail: "From account settings" },
    { id: "ac8", time: "1w ago", type: "login", title: "New device sign-in", detail: "iPhone 15 Pro · Safari" },
  ]),

  getSessions: (): Promise<Session[]> => delay([
    { id: "s1", device: "MacBook Pro 16\"", browser: "Chrome 131", os: "macOS 15.1", location: "Bengaluru, IN", ip: "203.0.113.42", lastActive: "Active now", current: true },
    { id: "s2", device: "iPhone 15 Pro", browser: "Safari", os: "iOS 18.1", location: "Bengaluru, IN", ip: "203.0.113.42", lastActive: "1 hour ago", current: false },
    { id: "s3", device: "iPad Air", browser: "Safari", os: "iPadOS 18", location: "Bengaluru, IN", ip: "203.0.113.44", lastActive: "3 days ago", current: false },
    { id: "s4", device: "Windows Laptop", browser: "Edge 129", os: "Windows 11", location: "Mumbai, IN", ip: "198.51.100.7", lastActive: "2 weeks ago", current: false },
  ]),
};
