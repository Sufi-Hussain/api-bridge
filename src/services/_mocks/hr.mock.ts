// Consolidated HR domain service. Realistic, internally-consistent enterprise
// mock data. Every route consumes these functions so backend swap-in only
// requires replacing bodies with REST calls.

export type EmploymentStatus = "active" | "on_leave" | "notice" | "probation" | "exited";
export type EmploymentType = "full_time" | "contract" | "intern" | "part_time";
export type Gender = "male" | "female" | "other";

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  jobTitle: string;
  department: string;
  team: string;
  location: string;
  country: string;
  managerId: string | null;
  managerName?: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  grade: string;
  band: string;
  joinDate: string;
  dob: string;
  salaryBase: number;
  currency: string;
  tenureMonths: number;
  performanceRating: number; // 1..5
  potential: "low" | "medium" | "high";
  skills: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId: string;
  headName: string;
  parentId: string | null;
  headcount: number;
  openPositions: number;
  budgetUsd: number;
  attritionYtd: number;
  costCenter: string;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  leadId: string;
  members: number;
  location: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  timezone: string;
  headcount: number;
  type: "hq" | "office" | "remote_hub";
}

export interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  hiringManager: string;
  recruiter: string;
  status: "draft" | "pending_approval" | "approved" | "on_hold" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  openings: number;
  filled: number;
  createdAt: string;
  targetStart: string;
  budget: number;
  reason: "backfill" | "new_role" | "growth";
}

export interface JobOpening {
  id: string;
  requisitionId: string;
  title: string;
  department: string;
  location: string;
  type: EmploymentType;
  applicants: number;
  qualified: number;
  status: "open" | "on_hold" | "closed";
  postedDays: number;
  channels: string[];
  compRange: string;
}

export type CandidateStage =
  | "sourced"
  | "screen"
  | "interview"
  | "assessment"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrew";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  requisitionId: string;
  stage: CandidateStage;
  rating: number;
  yearsExp: number;
  currentCompany: string;
  location: string;
  source: string;
  recruiter: string;
  appliedAt: string;
  lastActivity: string;
  expectedCtc: number;
  currentCtc: number;
  noticeDays: number;
  tags: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  round: string;
  interviewer: string;
  scheduledAt: string;
  durationMin: number;
  mode: "video" | "onsite" | "phone";
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  feedback?: { score: number; recommendation: "hire" | "no_hire" | "maybe"; notes: string };
}

export interface Offer {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  department: string;
  ctc: number;
  currency: string;
  joinDate: string;
  status: "draft" | "pending_approval" | "sent" | "accepted" | "declined" | "expired";
  approver: string;
  sentAt?: string;
  expiresAt: string;
}

export interface OnboardingHire {
  id: string;
  candidateName: string;
  role: string;
  department: string;
  manager: string;
  location: string;
  joinDate: string;
  progress: number;
  tasksTotal: number;
  tasksDone: number;
  status: "preboarding" | "in_progress" | "completed" | "delayed";
  buddy: string;
}

export interface OnboardingTask {
  id: string;
  hireId: string;
  hireName: string;
  task: string;
  category: "docs" | "it" | "hr" | "training" | "meet";
  owner: string;
  dueDate: string;
  status: "todo" | "in_progress" | "done" | "blocked";
}

export interface Resignation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  manager: string;
  submittedAt: string;
  lastWorkingDay: string;
  reason: string;
  status: "submitted" | "manager_review" | "hr_review" | "approved" | "rejected" | "revoked";
  clearanceProgress: number;
  exitInterviewDone: boolean;
}

export interface PerformanceCycle {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  reviewWindow: string;
  status: "upcoming" | "self_review" | "manager_review" | "calibration" | "closed";
  eligible: number;
  completed: number;
  template: string;
}

export interface Goal {
  id: string;
  title: string;
  owner: string;
  ownerId: string;
  cycle: string;
  type: "individual" | "team" | "company";
  weight: number;
  progress: number;
  status: "on_track" | "at_risk" | "off_track" | "completed";
  keyResults: { title: string; progress: number; target: string }[];
  due: string;
}

export interface Review {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  cycle: string;
  reviewer: string;
  status: "not_started" | "in_progress" | "submitted" | "calibrated" | "shared";
  selfRating?: number;
  managerRating?: number;
  finalRating?: number;
  submittedAt?: string;
}

export interface Competency {
  id: string;
  name: string;
  category: "leadership" | "functional" | "behavioral" | "technical";
  description: string;
  levels: number;
  applies: string[];
}

export interface SalaryBand {
  id: string;
  grade: string;
  role: string;
  department: string;
  minUsd: number;
  midUsd: number;
  maxUsd: number;
  currentAvgUsd: number;
  headcount: number;
  currency: string;
}

export interface Promotion {
  id: string;
  employeeName: string;
  fromGrade: string;
  toGrade: string;
  department: string;
  effective: string;
  currentSalary: number;
  proposedSalary: number;
  hikePct: number;
  status: "recommended" | "approved" | "on_hold" | "rejected";
  recommender: string;
  justification: string;
}

export interface LeavePolicy {
  id: string;
  name: string;
  leaveType: string;
  entitlement: number;
  carryForward: number;
  applicableTo: string;
  accrual: "monthly" | "yearly" | "on_join";
  minService: number;
  status: "active" | "draft" | "archived";
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  breakMin: number;
  weekOffs: string[];
  assigned: number;
  color: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: "national" | "regional" | "optional" | "restricted";
  locations: string[];
  day: string;
}

export interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  owner: string;
  updatedAt: string;
  effective: string;
  audience: string;
  ackRate: number;
  status: "published" | "draft" | "archived";
}

export interface BgvCase {
  id: string;
  employeeName: string;
  role: string;
  vendor: string;
  status: "initiated" | "in_progress" | "clear" | "discrepancy" | "insufficient";
  startedAt: string;
  completedAt?: string;
  checks: string[];
}

export interface Contract {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired" | "renewed";
  location: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  module: string;
  ip: string;
  timestamp: string;
}

export interface Grievance {
  id: string;
  reportedBy: string;
  anonymous: boolean;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  submittedAt: string;
  assignedTo: string;
  status: "open" | "investigating" | "resolved" | "escalated" | "closed";
  summary: string;
}

export interface DisciplinaryCase {
  id: string;
  employeeName: string;
  department: string;
  category: string;
  severity: "verbal" | "written" | "final" | "termination";
  raisedBy: string;
  raisedAt: string;
  status: "open" | "review" | "action_taken" | "closed";
}

export interface Recognition {
  id: string;
  from: string;
  to: string;
  category: "spot" | "value" | "milestone" | "peer";
  points: number;
  message: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: "company" | "hr" | "policy" | "event" | "celebration";
  author: string;
  audience: string;
  publishedAt: string;
  pinned: boolean;
  reactions: number;
  views: number;
  excerpt: string;
}

export interface PulseSurvey {
  id: string;
  name: string;
  cycle: string;
  sent: number;
  responded: number;
  eNps: number;
  status: "draft" | "running" | "closed";
  launchedAt: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  category: string;
  format: "instructor" | "self_paced" | "blended";
  durationHrs: number;
  enrolled: number;
  completed: number;
  rating: number;
  status: "active" | "draft" | "archived";
  mandatory: boolean;
}

export interface Certification {
  id: string;
  employeeName: string;
  cert: string;
  issuer: string;
  issued: string;
  expires: string;
  status: "valid" | "expiring" | "expired";
}

export interface SkillMatrixRow {
  skill: string;
  category: string;
  beginner: number;
  intermediate: number;
  advanced: number;
  expert: number;
  gap: number;
}

export interface SuccessionCandidate {
  role: string;
  incumbent: string;
  readyNow: string[];
  ready1yr: string[];
  ready2yr: string[];
  risk: "low" | "medium" | "high";
}

// ─────────────────────── Data generation ───────────────────────
const FIRST = ["Aarav","Priya","Rohan","Meera","Ishaan","Zara","Kabir","Anaya","Vihaan","Diya","Arjun","Sara","Neel","Riya","Aditya","Kiara","Yash","Nisha","Dev","Aisha","Rahul","Nikhil","Pooja","Sneha","Karan","Tanya","Aman","Radhika","Sanjay","Mira","Ananya","Vikram","Naveen","Divya","Manish","Sonia","Rakesh","Bhavya","Alok","Pallavi"];
const LAST = ["Sharma","Patel","Verma","Iyer","Khan","Reddy","Nair","Kapoor","Mehta","Gupta","Singh","Bose","Rao","Joshi","Malhotra","Chopra","Bhat","Menon","Desai","Pillai"];
const DEPTS = ["Engineering","Design","Product","Marketing","Sales","People","Finance","Operations","Support","Legal","Data","Security"];
const TITLES: Record<string, string[]> = {
  Engineering: ["Software Engineer","Senior Engineer","Staff Engineer","Engineering Manager","Principal Engineer"],
  Design: ["Product Designer","Senior Designer","Design Lead","Design Manager"],
  Product: ["Product Manager","Senior PM","Group PM","Director, Product"],
  Marketing: ["Marketing Manager","Growth Lead","Content Manager","Brand Manager"],
  Sales: ["Account Executive","Sales Manager","AE Lead","Regional Director"],
  People: ["HRBP","People Ops","Talent Partner","VP People"],
  Finance: ["Finance Analyst","Controller","Finance Manager","Director Finance"],
  Operations: ["Operations Specialist","Ops Manager","Program Manager"],
  Support: ["Support Engineer","Support Lead","CX Manager"],
  Legal: ["Legal Counsel","Compliance Manager"],
  Data: ["Data Analyst","Data Engineer","Data Scientist","ML Engineer"],
  Security: ["Security Analyst","Security Engineer","CISO"],
};
const LOCS_LIST = [
  { name: "Bangalore HQ", city: "Bangalore", country: "India", tz: "Asia/Kolkata", type: "hq" as const },
  { name: "Mumbai Office", city: "Mumbai", country: "India", tz: "Asia/Kolkata", type: "office" as const },
  { name: "New York", city: "New York", country: "USA", tz: "America/New_York", type: "office" as const },
  { name: "London", city: "London", country: "UK", tz: "Europe/London", type: "office" as const },
  { name: "Berlin", city: "Berlin", country: "Germany", tz: "Europe/Berlin", type: "office" as const },
  { name: "Singapore", city: "Singapore", country: "Singapore", tz: "Asia/Singapore", type: "office" as const },
  { name: "Remote · EMEA", city: "Distributed", country: "EMEA", tz: "UTC", type: "remote_hub" as const },
  { name: "Remote · APAC", city: "Distributed", country: "APAC", tz: "UTC", type: "remote_hub" as const },
];
const GRADES = ["L2","L3","L4","L5","M1","M2","M3","D1","D2","VP"];
const BANDS = ["Individual","Senior","Lead","Manager","Director","VP"];
const SKILLS_POOL = ["React","TypeScript","Python","Go","Java","Kubernetes","AWS","SQL","Figma","Product Strategy","Data Analysis","Leadership","SEO","Copywriting","Sales Ops","Compliance","People Management","Coaching","GTM","LLMs","Design Systems","Node.js","Rust","Terraform"];

function seed(n: number) { let x = n; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32; }
const rnd = seed(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const pickN = <T,>(arr: T[], n: number) => {
  const out = new Set<T>();
  while (out.size < n && out.size < arr.length) out.add(pick(arr));
  return [...out];
};

// Build 320 employees
const EMPLOYEES: Employee[] = [];
for (let i = 0; i < 320; i++) {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7) % LAST.length];
  const dept = DEPTS[i % DEPTS.length];
  const title = TITLES[dept][i % TITLES[dept].length];
  const loc = LOCS_LIST[i % LOCS_LIST.length];
  const grade = GRADES[i % GRADES.length];
  const band = BANDS[Math.min(BANDS.length - 1, Math.floor(i / 60))];
  const joinYear = 2018 + (i % 7);
  const join = new Date(joinYear, i % 12, 1 + (i % 27));
  const tenure = Math.max(1, Math.floor((Date.now() - join.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  EMPLOYEES.push({
    id: `emp_${1000 + i}`,
    empCode: `EMP-${10000 + i}`,
    name: `${first} ${last}`,
    email: `${first}.${last}`.toLowerCase() + "@acme.com",
    phone: `+91 9${String(100000000 + i * 137).slice(0, 9)}`,
    gender: (["male","female","other"] as Gender[])[i % 3],
    jobTitle: title,
    department: dept,
    team: `${dept} · Team ${((i % 4) + 1).toString()}`,
    location: loc.name,
    country: loc.country,
    managerId: i > 8 ? `emp_${1000 + (i % 8)}` : null,
    managerName: i > 8 ? `${FIRST[(i % 8)]} ${LAST[((i % 8) * 7) % LAST.length]}` : undefined,
    employmentType: (["full_time","full_time","full_time","contract","intern"] as EmploymentType[])[i % 5],
    status:
      i % 41 === 0 ? "notice" : i % 29 === 0 ? "on_leave" : i % 23 === 0 ? "probation" : "active",
    grade,
    band,
    joinDate: join.toISOString().slice(0, 10),
    dob: new Date(1985 + (i % 15), i % 12, 1 + (i % 27)).toISOString().slice(0, 10),
    salaryBase: 40000 + (i % 20) * 8500 + (i % 5) * 3500,
    currency: loc.country === "India" ? "INR" : loc.country === "USA" ? "USD" : "EUR",
    tenureMonths: tenure,
    performanceRating: 2 + ((i * 3) % 4),
    potential: (["low","medium","high"] as const)[i % 3],
    skills: pickN(SKILLS_POOL, 3 + (i % 4)),
  });
}

async function delay<T>(v: T, ms = 180): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

// ─────────────────────── Public API ───────────────────────
export const employeeService = {
  async list(): Promise<Employee[]> { return delay(EMPLOYEES); },
  async get(id: string): Promise<Employee | undefined> { return delay(EMPLOYEES.find((e) => e.id === id)); },
  async byDepartment(dept: string): Promise<Employee[]> { return delay(EMPLOYEES.filter((e) => e.department === dept)); },
  async directReports(managerId: string): Promise<Employee[]> {
    return delay(EMPLOYEES.filter((e) => e.managerId === managerId));
  },
  async stats() {
    const active = EMPLOYEES.filter((e) => e.status === "active").length;
    const onLeave = EMPLOYEES.filter((e) => e.status === "on_leave").length;
    const notice = EMPLOYEES.filter((e) => e.status === "notice").length;
    const probation = EMPLOYEES.filter((e) => e.status === "probation").length;
    return delay({
      total: EMPLOYEES.length,
      active,
      onLeave,
      notice,
      probation,
      byDept: DEPTS.map((d) => ({ name: d, value: EMPLOYEES.filter((e) => e.department === d).length })),
      byLocation: LOCS_LIST.map((l) => ({ name: l.name, value: EMPLOYEES.filter((e) => e.location === l.name).length })),
      byBand: BANDS.map((b) => ({ name: b, value: EMPLOYEES.filter((e) => e.band === b).length })),
      genderMix: (["male","female","other"] as Gender[]).map((g) => ({
        name: g, value: EMPLOYEES.filter((e) => e.gender === g).length,
      })),
    });
  },
};

export const departmentService = {
  async list(): Promise<Department[]> {
    return delay(
      DEPTS.map((d, i) => {
        const empsInDept = EMPLOYEES.filter((e) => e.department === d);
        const head = empsInDept[0];
        return {
          id: `dept_${i}`,
          name: d,
          code: d.slice(0, 3).toUpperCase(),
          headId: head?.id ?? "",
          headName: head?.name ?? "Unassigned",
          parentId: i > 5 ? `dept_${i % 5}` : null,
          headcount: empsInDept.length,
          openPositions: (i * 3) % 12,
          budgetUsd: 350_000 + i * 92_000,
          attritionYtd: 4 + (i % 8),
          costCenter: `CC-${1000 + i * 10}`,
        };
      }),
    );
  },
};

export const teamService = {
  async list(): Promise<Team[]> {
    const list: Team[] = [];
    DEPTS.forEach((d, di) => {
      for (let k = 1; k <= 3; k++) {
        const members = EMPLOYEES.filter((e) => e.team === `${d} · Team ${k}`);
        list.push({
          id: `team_${di}_${k}`,
          name: `${d} · Team ${k}`,
          departmentId: `dept_${di}`,
          leadId: members[0]?.id ?? "",
          members: members.length,
          location: members[0]?.location ?? "Bangalore HQ",
        });
      }
    });
    return delay(list);
  },
};

export const locationService = {
  async list(): Promise<Location[]> {
    return delay(
      LOCS_LIST.map((l, i) => ({
        id: `loc_${i}`,
        name: l.name,
        city: l.city,
        country: l.country,
        address: l.type === "remote_hub" ? "Distributed workforce" : `${100 + i * 12} ${l.city} Blvd, ${l.city}`,
        timezone: l.tz,
        headcount: EMPLOYEES.filter((e) => e.location === l.name).length,
        type: l.type,
      })),
    );
  },
};

// Recruitment ------------------------------------------------------
const REQ_TITLES = [
  "Senior Software Engineer","Product Designer","Data Scientist","Engineering Manager",
  "Sales Executive","People Business Partner","Growth Marketing Lead","Finance Analyst",
  "DevOps Engineer","Product Manager","Content Strategist","Customer Success Manager",
];
const REQS: Requisition[] = REQ_TITLES.flatMap((t, i) => {
  const openings = 1 + (i % 4);
  return [{
    id: `req_${100 + i}`,
    title: t,
    department: DEPTS[i % DEPTS.length],
    location: LOCS_LIST[i % LOCS_LIST.length].name,
    employmentType: (["full_time","full_time","contract"] as EmploymentType[])[i % 3],
    hiringManager: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
    recruiter: `${FIRST[(i + 5) % FIRST.length]} ${LAST[((i + 3) * 7) % LAST.length]}`,
    status: (["approved","approved","pending_approval","approved","on_hold","approved"] as Requisition["status"][])[i % 6],
    priority: (["low","medium","high","critical"] as const)[i % 4],
    openings,
    filled: Math.floor(openings * ((i % 3) / 3)),
    createdAt: `${(i % 27) + 1} Oct 2026`,
    targetStart: `${(i % 27) + 1} Jan 2027`,
    budget: 80_000 + (i % 6) * 25_000,
    reason: (["backfill","new_role","growth"] as const)[i % 3],
  }];
});

const CANDIDATES: Candidate[] = [];
const STAGES: CandidateStage[] = ["sourced","screen","interview","assessment","offer","hired","rejected","withdrew"];
for (let i = 0; i < 84; i++) {
  const req = REQS[i % REQS.length];
  CANDIDATES.push({
    id: `cand_${i}`,
    name: `${FIRST[(i * 3) % FIRST.length]} ${LAST[(i * 5) % LAST.length]}`,
    email: `cand${i}@example.com`,
    phone: `+91 8${String(100000000 + i * 173).slice(0, 9)}`,
    role: req.title,
    requisitionId: req.id,
    stage: STAGES[i % STAGES.length],
    rating: 3 + ((i * 7) % 20) / 10,
    yearsExp: 2 + (i % 12),
    currentCompany: pick(["Google","Microsoft","Amazon","Meta","Stripe","Uber","Flipkart","Zoho","Razorpay","Wipro","Infosys","TCS"]),
    location: LOCS_LIST[i % LOCS_LIST.length].city,
    source: pick(["LinkedIn","Referral","Careers","Naukri","Agency","Instahyre"]),
    recruiter: req.recruiter,
    appliedAt: `${(i % 28) + 1} Nov`,
    lastActivity: `${(i % 20) + 1}h ago`,
    expectedCtc: 800000 + (i % 10) * 250000,
    currentCtc: 700000 + (i % 10) * 220000,
    noticeDays: [15, 30, 60, 90][i % 4],
    tags: pickN(["urgent","top-tier","remote-ok","internal-referral","strong-portfolio"], 1 + (i % 3)),
  });
}

const INTERVIEWS: Interview[] = CANDIDATES.slice(0, 30).map((c, i) => ({
  id: `int_${i}`,
  candidateId: c.id,
  candidateName: c.name,
  role: c.role,
  round: (["Phone screen","Tech round 1","Tech round 2","System design","Hiring manager","Bar raiser"])[i % 6],
  interviewer: `${FIRST[(i + 2) % FIRST.length]} ${LAST[(i + 6) % LAST.length]}`,
  scheduledAt: `Nov ${18 + (i % 10)}, ${9 + (i % 8)}:00`,
  durationMin: [30, 45, 60, 90][i % 4],
  mode: (["video","onsite","phone"] as const)[i % 3],
  status: (["scheduled","completed","scheduled","completed","cancelled"] as const)[i % 5],
  feedback: i % 5 === 1 || i % 5 === 3 ? {
    score: 3 + (i % 3),
    recommendation: (["hire","no_hire","maybe"] as const)[i % 3],
    notes: "Strong technical fundamentals; recommend advancing.",
  } : undefined,
}));

const OFFERS: Offer[] = CANDIDATES.filter((c) => c.stage === "offer" || c.stage === "hired").map((c, i) => ({
  id: `off_${i}`,
  candidateId: c.id,
  candidateName: c.name,
  role: c.role,
  department: REQS.find((r) => r.id === c.requisitionId)?.department ?? "Engineering",
  ctc: c.expectedCtc,
  currency: "INR",
  joinDate: `Dec ${(i % 28) + 1}, 2026`,
  status: (["draft","pending_approval","sent","accepted","declined","expired"] as const)[i % 6],
  approver: `${FIRST[(i + 4) % FIRST.length]} ${LAST[(i + 2) % LAST.length]}`,
  sentAt: `Nov ${(i % 20) + 1}`,
  expiresAt: `Dec ${(i % 15) + 1}`,
}));

export const recruitmentService = {
  async requisitions(): Promise<Requisition[]> { return delay(REQS); },
  async openings(): Promise<JobOpening[]> {
    return delay(REQS.filter((r) => r.status === "approved").map((r, i) => ({
      id: `job_${i}`,
      requisitionId: r.id,
      title: r.title,
      department: r.department,
      location: r.location,
      type: r.employmentType,
      applicants: 12 + (i * 17) % 120,
      qualified: 4 + (i * 3) % 30,
      status: (["open","open","open","on_hold"] as const)[i % 4],
      postedDays: (i * 3) % 45,
      channels: pickN(["LinkedIn","Company site","Referral","Naukri","Instahyre","Angel"], 2 + (i % 3)),
      compRange: "₹18–32 LPA",
    })));
  },
  async candidates(): Promise<Candidate[]> { return delay(CANDIDATES); },
  async candidatesByStage() {
    return delay(STAGES.map((s) => ({ stage: s, count: CANDIDATES.filter((c) => c.stage === s).length })));
  },
  async interviews(): Promise<Interview[]> { return delay(INTERVIEWS); },
  async offers(): Promise<Offer[]> { return delay(OFFERS); },
  async funnel() {
    return delay([
      { stage: "Sourced", count: 480 },
      { stage: "Applied", count: 322 },
      { stage: "Screened", count: 168 },
      { stage: "Interview", count: 96 },
      { stage: "Offer", count: 34 },
      { stage: "Hired", count: 21 },
    ]);
  },
  async hiringTrend() {
    return delay([
      { month: "Jun", opened: 32, closed: 18, tth: 41 },
      { month: "Jul", opened: 36, closed: 22, tth: 39 },
      { month: "Aug", opened: 41, closed: 28, tth: 37 },
      { month: "Sep", opened: 38, closed: 30, tth: 35 },
      { month: "Oct", opened: 44, closed: 27, tth: 34 },
      { month: "Nov", opened: 52, closed: 33, tth: 32 },
    ]);
  },
  async sourceMix() {
    return delay([
      { name: "LinkedIn", value: 42 },
      { name: "Referral", value: 26 },
      { name: "Careers", value: 14 },
      { name: "Agency", value: 10 },
      { name: "Naukri", value: 8 },
    ]);
  },
  async talentPool() {
    return delay(CANDIDATES.filter((c) => c.stage === "rejected" || c.stage === "withdrew").slice(0, 24));
  },
};

// Onboarding / Offboarding ----------------------------------------
const HIRES: OnboardingHire[] = Array.from({ length: 14 }, (_, i) => {
  const total = 12 + (i % 4);
  const done = Math.floor(total * ((i % 5) / 5));
  return {
    id: `hire_${i}`,
    candidateName: `${FIRST[(i * 4) % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
    role: REQ_TITLES[i % REQ_TITLES.length],
    department: DEPTS[i % DEPTS.length],
    manager: `${FIRST[(i + 6) % FIRST.length]} ${LAST[(i + 4) % LAST.length]}`,
    location: LOCS_LIST[i % LOCS_LIST.length].name,
    joinDate: `Nov ${20 + (i % 10)}`,
    progress: Math.round((done / total) * 100),
    tasksTotal: total,
    tasksDone: done,
    status: (["preboarding","in_progress","in_progress","completed","delayed"] as const)[i % 5],
    buddy: `${FIRST[(i + 3) % FIRST.length]} ${LAST[(i + 5) % LAST.length]}`,
  };
});

const ONB_TASKS: OnboardingTask[] = [];
const TASK_CATS = ["Collect ID proof","Assign laptop","Set up email","Buddy assignment","Orientation session","Sign NDA","Bank details","Emergency contacts","Team intro","Policy acknowledgement","Slack access","Payroll enrollment"];
HIRES.forEach((h, hi) => {
  TASK_CATS.forEach((t, ti) => {
    if (ti < h.tasksTotal) {
      ONB_TASKS.push({
        id: `otsk_${hi}_${ti}`,
        hireId: h.id,
        hireName: h.candidateName,
        task: t,
        category: (["docs","it","hr","training","meet"] as const)[ti % 5],
        owner: pick(["HR Ops","IT","Finance","Manager","Buddy"]),
        dueDate: `Nov ${20 + (ti % 10)}`,
        status: ti < h.tasksDone ? "done" : ti === h.tasksDone ? "in_progress" : ti % 7 === 0 ? "blocked" : "todo",
      });
    }
  });
});

const RESIGNATIONS: Resignation[] = Array.from({ length: 10 }, (_, i) => {
  const emp = EMPLOYEES[i * 17];
  return {
    id: `resg_${i}`,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    role: emp.jobTitle,
    manager: emp.managerName ?? "—",
    submittedAt: `Nov ${(i % 20) + 1}`,
    lastWorkingDay: `Dec ${(i % 28) + 1}`,
    reason: pick(["Career growth","Higher education","Relocation","Better opportunity","Personal reasons"]),
    status: (["submitted","manager_review","hr_review","approved","approved","rejected"] as const)[i % 6],
    clearanceProgress: 20 + (i * 11) % 80,
    exitInterviewDone: i % 3 === 0,
  };
});

export const lifecycleService = {
  async hires(): Promise<OnboardingHire[]> { return delay(HIRES); },
  async onboardingTasks(): Promise<OnboardingTask[]> { return delay(ONB_TASKS); },
  async resignations(): Promise<Resignation[]> { return delay(RESIGNATIONS); },
  async onboardingStats() {
    return delay({
      newHires: HIRES.length,
      inProgress: HIRES.filter((h) => h.status === "in_progress").length,
      delayed: HIRES.filter((h) => h.status === "delayed").length,
      completed: HIRES.filter((h) => h.status === "completed").length,
      avgProgress: Math.round(HIRES.reduce((s, h) => s + h.progress, 0) / HIRES.length),
    });
  },
};

// Performance ------------------------------------------------------
const CYCLES: PerformanceCycle[] = [
  { id: "cy_q4", name: "Q4 · 2026 Cycle", periodStart: "Oct 1", periodEnd: "Dec 31", reviewWindow: "Nov 15 – Dec 20", status: "manager_review", eligible: 1189, completed: 743, template: "Standard 5-point" },
  { id: "cy_q3", name: "Q3 · 2026 Cycle", periodStart: "Jul 1", periodEnd: "Sep 30", reviewWindow: "Aug 20 – Sep 25", status: "closed", eligible: 1156, completed: 1142, template: "Standard 5-point" },
  { id: "cy_h1_27", name: "H1 · 2027 Kickoff", periodStart: "Jan 1", periodEnd: "Jun 30", reviewWindow: "May 15 – Jun 25", status: "upcoming", eligible: 1220, completed: 0, template: "OKR + Values" },
  { id: "cy_probation", name: "Probation Reviews · Nov", periodStart: "Nov 1", periodEnd: "Nov 30", reviewWindow: "Nov 25 – Nov 30", status: "self_review", eligible: 46, completed: 22, template: "Probation 3-month" },
];

const GOALS: Goal[] = Array.from({ length: 18 }, (_, i) => ({
  id: `goal_${i}`,
  title: pick([
    "Increase activation rate by 20%","Launch v3 platform","Reduce infra cost by 12%",
    "Improve NPS to 55","Hire 20 engineers","Ship mobile app","Close $5M ARR",
    "Publish 4 case studies","Automate onboarding","Achieve SOC2 Type II","Reduce churn to 3.5%","Enable EU market entry",
  ]),
  owner: EMPLOYEES[i * 11].name,
  ownerId: EMPLOYEES[i * 11].id,
  cycle: "Q4 · 2026",
  type: (["individual","team","company"] as const)[i % 3],
  weight: [10, 15, 20, 25, 30][i % 5],
  progress: 15 + (i * 13) % 85,
  status: (["on_track","at_risk","off_track","on_track","completed"] as const)[i % 5],
  keyResults: Array.from({ length: 3 + (i % 2) }, (_, k) => ({
    title: pick(["Ship MVP","Reach milestone","Improve metric","Complete audit","Onboard cohort"]) + ` #${k + 1}`,
    progress: 20 + ((i + k) * 11) % 80,
    target: `${50 + k * 10}%`,
  })),
  due: `Dec ${15 + (i % 15)}`,
}));

const REVIEWS: Review[] = EMPLOYEES.slice(0, 42).map((e, i) => ({
  id: `rev_${i}`,
  employeeId: e.id,
  employeeName: e.name,
  role: e.jobTitle,
  cycle: "Q4 · 2026",
  reviewer: e.managerName ?? "Anjali Krishnan",
  status: (["not_started","in_progress","submitted","calibrated","shared"] as const)[i % 5],
  selfRating: i % 3 === 0 ? undefined : 3 + (i % 3),
  managerRating: i % 4 === 0 ? undefined : 3 + ((i + 1) % 3),
  finalRating: i % 5 < 2 ? undefined : 3 + ((i + 2) % 3),
  submittedAt: i % 2 === 0 ? `Nov ${(i % 20) + 1}` : undefined,
}));

const COMPETENCIES: Competency[] = [
  { id: "c1", name: "Strategic Thinking", category: "leadership", description: "Ability to see the bigger picture and align decisions with company vision.", levels: 5, applies: ["Manager","Director","VP"] },
  { id: "c2", name: "Coding Excellence", category: "technical", description: "Consistently produces high-quality, maintainable code.", levels: 5, applies: ["Engineering"] },
  { id: "c3", name: "Customer Obsession", category: "behavioral", description: "Puts customer needs first in every decision.", levels: 5, applies: ["All"] },
  { id: "c4", name: "People Leadership", category: "leadership", description: "Grows and develops team members effectively.", levels: 5, applies: ["Manager+"] },
  { id: "c5", name: "Design Craft", category: "functional", description: "Delivers polished, thoughtful design solutions.", levels: 5, applies: ["Design"] },
  { id: "c6", name: "Communication", category: "behavioral", description: "Clear, concise and empathetic communication.", levels: 5, applies: ["All"] },
  { id: "c7", name: "Data-driven Decisions", category: "functional", description: "Uses data to inform and validate decisions.", levels: 5, applies: ["All"] },
  { id: "c8", name: "Business Acumen", category: "functional", description: "Understanding of commercial context and P&L impact.", levels: 5, applies: ["Manager+"] },
];

export const performanceService = {
  async cycles(): Promise<PerformanceCycle[]> { return delay(CYCLES); },
  async goals(): Promise<Goal[]> { return delay(GOALS); },
  async reviews(): Promise<Review[]> { return delay(REVIEWS); },
  async competencies(): Promise<Competency[]> { return delay(COMPETENCIES); },
  async analytics() {
    return delay({
      ratingDistribution: [
        { rating: "5 · Exceptional", count: 84 },
        { rating: "4 · Exceeds", count: 312 },
        { rating: "3 · Meets", count: 618 },
        { rating: "2 · Below", count: 142 },
        { rating: "1 · Unsatisfactory", count: 33 },
      ],
      cycleProgress: CYCLES.map((c) => ({ name: c.name, done: c.completed, remaining: c.eligible - c.completed })),
      goalHealth: [
        { status: "On track", value: GOALS.filter((g) => g.status === "on_track").length },
        { status: "At risk", value: GOALS.filter((g) => g.status === "at_risk").length },
        { status: "Off track", value: GOALS.filter((g) => g.status === "off_track").length },
        { status: "Completed", value: GOALS.filter((g) => g.status === "completed").length },
      ],
    });
  },
};

// Compensation ----------------------------------------------------
const BANDS_DATA: SalaryBand[] = GRADES.map((g, i) => ({
  id: `sb_${i}`,
  grade: g,
  role: TITLES[DEPTS[i % DEPTS.length]][0],
  department: DEPTS[i % DEPTS.length],
  minUsd: 45000 + i * 12000,
  midUsd: 60000 + i * 15000,
  maxUsd: 80000 + i * 18000,
  currentAvgUsd: 58000 + i * 14200,
  headcount: 20 + (i * 11) % 80,
  currency: "USD",
}));

const PROMOTIONS: Promotion[] = Array.from({ length: 12 }, (_, i) => {
  const cur = 900000 + i * 120000;
  const nxt = cur * (1.12 + (i % 5) * 0.02);
  return {
    id: `pr_${i}`,
    employeeName: EMPLOYEES[i * 9].name,
    fromGrade: GRADES[i % GRADES.length],
    toGrade: GRADES[Math.min(GRADES.length - 1, (i % GRADES.length) + 1)],
    department: EMPLOYEES[i * 9].department,
    effective: `Jan ${(i % 28) + 1}, 2027`,
    currentSalary: cur,
    proposedSalary: Math.round(nxt),
    hikePct: Math.round(((nxt - cur) / cur) * 100),
    status: (["recommended","recommended","approved","on_hold","approved","rejected"] as const)[i % 6],
    recommender: EMPLOYEES[i * 9].managerName ?? "Priya Menon",
    justification: pick([
      "Consistently exceeds expectations over 4 quarters.",
      "Led major initiative delivering $2M impact.",
      "Ready for expanded scope and team leadership.",
      "Retention risk — market comp adjustment required.",
    ]),
  };
});

export const compensationService = {
  async bands(): Promise<SalaryBand[]> { return delay(BANDS_DATA); },
  async promotions(): Promise<Promotion[]> { return delay(PROMOTIONS); },
  async incrementSummary() {
    return delay({
      cycle: "Annual · Jan 2027",
      budgetUsd: 4_200_000,
      allocatedUsd: 3_180_000,
      avgHikePct: 9.4,
      topPerformerPct: 18.2,
      byDept: DEPTS.slice(0, 8).map((d, i) => ({ name: d, avg: 6 + (i % 8) })),
      trend: [
        { year: "2022", avg: 7.8 }, { year: "2023", avg: 8.4 }, { year: "2024", avg: 9.1 },
        { year: "2025", avg: 9.6 }, { year: "2026", avg: 10.2 },
      ],
    });
  },
};

// Workforce planning ----------------------------------------------
export const workforceService = {
  async headcountTrend() {
    return delay([
      { month: "Jun", active: 1108, target: 1200 },
      { month: "Jul", active: 1121, target: 1210 },
      { month: "Aug", active: 1142, target: 1220 },
      { month: "Sep", active: 1163, target: 1230 },
      { month: "Oct", active: 1178, target: 1240 },
      { month: "Nov", active: 1189, target: 1250 },
      { month: "Dec (fcst)", active: 1215, target: 1260 },
    ]);
  },
  async attritionTrend() {
    return delay([
      { month: "Jun", voluntary: 1.1, involuntary: 0.2 },
      { month: "Jul", voluntary: 1.4, involuntary: 0.2 },
      { month: "Aug", voluntary: 1.2, involuntary: 0.3 },
      { month: "Sep", voluntary: 1.0, involuntary: 0.1 },
      { month: "Oct", voluntary: 0.9, involuntary: 0.3 },
      { month: "Nov", voluntary: 1.3, involuntary: 0.2 },
    ]);
  },
  async attritionByReason() {
    return delay([
      { reason: "Career growth", value: 32 },
      { reason: "Compensation", value: 21 },
      { reason: "Relocation", value: 12 },
      { reason: "Manager", value: 10 },
      { reason: "Work-life", value: 14 },
      { reason: "Other", value: 11 },
    ]);
  },
  async succession(): Promise<SuccessionCandidate[]> {
    return delay([
      { role: "VP Engineering", incumbent: "Priya Menon", readyNow: ["Rohan Iyer"], ready1yr: ["Meera Kapoor","Kabir Shah"], ready2yr: ["Neel Bose"], risk: "low" },
      { role: "VP Product", incumbent: "Ishaan Verma", readyNow: [], ready1yr: ["Kabir Shah"], ready2yr: ["Aisha Rao","Diya Nair"], risk: "high" },
      { role: "VP People", incumbent: "Aditya Rao", readyNow: ["Diya Nair"], ready1yr: ["Yash Bose"], ready2yr: [], risk: "medium" },
      { role: "Director Finance", incumbent: "Manish Bose", readyNow: ["Sonia Kapoor"], ready1yr: [], ready2yr: ["Rakesh Verma"], risk: "medium" },
      { role: "Head of Design", incumbent: "Zara Khan", readyNow: [], ready1yr: ["Aarav Sharma","Riya Nair"], ready2yr: [], risk: "high" },
    ]);
  },
};

// Leave & attendance admin ---------------------------------------
export const leaveAdminService = {
  async policies(): Promise<LeavePolicy[]> {
    return delay([
      { id: "lp1", name: "Standard PTO", leaveType: "Casual", entitlement: 12, carryForward: 5, applicableTo: "All full-time", accrual: "monthly", minService: 0, status: "active" },
      { id: "lp2", name: "Sick Leave", leaveType: "Sick", entitlement: 10, carryForward: 3, applicableTo: "All employees", accrual: "yearly", minService: 0, status: "active" },
      { id: "lp3", name: "Maternity", leaveType: "Maternity", entitlement: 182, carryForward: 0, applicableTo: "Female employees", accrual: "on_join", minService: 6, status: "active" },
      { id: "lp4", name: "Paternity", leaveType: "Paternity", entitlement: 15, carryForward: 0, applicableTo: "Male employees", accrual: "on_join", minService: 6, status: "active" },
      { id: "lp5", name: "Bereavement", leaveType: "Bereavement", entitlement: 5, carryForward: 0, applicableTo: "All", accrual: "on_join", minService: 0, status: "active" },
      { id: "lp6", name: "Sabbatical (Draft)", leaveType: "Sabbatical", entitlement: 30, carryForward: 0, applicableTo: "5+ yr tenure", accrual: "on_join", minService: 60, status: "draft" },
    ]);
  },
  async holidays(): Promise<Holiday[]> {
    return delay([
      { id: "h1", name: "Republic Day", date: "Jan 26, 2027", type: "national", locations: ["India"], day: "Tue" },
      { id: "h2", name: "Holi", date: "Mar 15, 2027", type: "national", locations: ["India"], day: "Mon" },
      { id: "h3", name: "Independence Day", date: "Jul 4, 2027", type: "national", locations: ["USA"], day: "Sun" },
      { id: "h4", name: "Diwali", date: "Nov 8, 2027", type: "national", locations: ["India"], day: "Mon" },
      { id: "h5", name: "Christmas", date: "Dec 25, 2027", type: "national", locations: ["All"], day: "Sat" },
      { id: "h6", name: "Founder's Day", date: "May 20, 2027", type: "optional", locations: ["All"], day: "Thu" },
      { id: "h7", name: "Onam", date: "Sep 6, 2027", type: "regional", locations: ["India · South"], day: "Mon" },
      { id: "h8", name: "Thanksgiving", date: "Nov 25, 2027", type: "national", locations: ["USA"], day: "Thu" },
    ]);
  },
  async pendingApprovals() {
    return delay(
      EMPLOYEES.slice(0, 8).map((e, i) => ({
        id: `la_${i}`,
        employeeName: e.name,
        type: pick(["Casual","Sick","Personal","Optional"]),
        from: `Nov ${20 + i}`,
        to: `Nov ${22 + i}`,
        days: 2 + (i % 3),
        reason: pick(["Family event","Not well","Vacation","Personal work"]),
      })),
    );
  },
};

export const attendanceAdminService = {
  async shifts(): Promise<Shift[]> {
    return delay([
      { id: "sh1", name: "General", start: "09:00", end: "18:00", breakMin: 60, weekOffs: ["Sat","Sun"], assigned: 812, color: "var(--chart-1)" },
      { id: "sh2", name: "Early", start: "07:00", end: "16:00", breakMin: 45, weekOffs: ["Sat","Sun"], assigned: 128, color: "var(--chart-2)" },
      { id: "sh3", name: "Late", start: "13:00", end: "22:00", breakMin: 60, weekOffs: ["Sun","Mon"], assigned: 96, color: "var(--chart-3)" },
      { id: "sh4", name: "Night", start: "22:00", end: "07:00", breakMin: 60, weekOffs: ["Fri","Sat"], assigned: 82, color: "var(--chart-4)" },
      { id: "sh5", name: "Flexible", start: "flex", end: "flex", breakMin: 60, weekOffs: ["Sat","Sun"], assigned: 71, color: "var(--chart-5)" },
    ]);
  },
  async stats() {
    return delay({
      present: 1104,
      absent: 42,
      onLeave: 41,
      wfh: 218,
      lateToday: 26,
      overtimeToday: 34,
      attendanceRate: 94.2,
      trend: Array.from({ length: 14 }, (_, i) => ({
        day: `${i + 1}`,
        present: 1080 + ((i * 13) % 40),
        absent: 30 + ((i * 5) % 20),
      })),
    });
  },
  async corrections() {
    return delay(
      Array.from({ length: 8 }, (_, i) => ({
        id: `ac_${i}`,
        employee: EMPLOYEES[i * 13].name,
        date: `Nov ${(i % 20) + 1}`,
        type: pick(["Missing punch-in","Missing punch-out","Wrong shift","On duty"]),
        raisedAt: `${(i % 5) + 1}d ago`,
        status: (["pending","approved","rejected"] as const)[i % 3],
      })),
    );
  },
};

// Documents & compliance ----------------------------------------
export const documentService = {
  async policies(): Promise<Policy[]> {
    return delay([
      { id: "pol1", title: "Code of Conduct", category: "Corporate", version: "v3.2", owner: "Legal", updatedAt: "Oct 12, 2026", effective: "Nov 1, 2026", audience: "All employees", ackRate: 98, status: "published" },
      { id: "pol2", title: "Travel & Expense", category: "Finance", version: "v2.8", owner: "Finance", updatedAt: "Sep 20, 2026", effective: "Oct 1, 2026", audience: "All employees", ackRate: 92, status: "published" },
      { id: "pol3", title: "Information Security", category: "Security", version: "v4.1", owner: "Security", updatedAt: "Nov 5, 2026", effective: "Nov 15, 2026", audience: "All", ackRate: 78, status: "published" },
      { id: "pol4", title: "Remote Work", category: "HR", version: "v1.6", owner: "People Ops", updatedAt: "Aug 8, 2026", effective: "Aug 15, 2026", audience: "All", ackRate: 100, status: "published" },
      { id: "pol5", title: "Anti-Harassment (POSH)", category: "Compliance", version: "v3.0", owner: "Legal", updatedAt: "Jul 1, 2026", effective: "Jul 15, 2026", audience: "All", ackRate: 99, status: "published" },
      { id: "pol6", title: "Data Privacy (GDPR)", category: "Compliance", version: "v2.4", owner: "Legal", updatedAt: "Jun 15, 2026", effective: "Jul 1, 2026", audience: "EU/UK employees", ackRate: 95, status: "published" },
      { id: "pol7", title: "Parental Leave (Draft)", category: "HR", version: "v0.9", owner: "People Ops", updatedAt: "Nov 18, 2026", effective: "Jan 1, 2027", audience: "All", ackRate: 0, status: "draft" },
    ]);
  },
  async templates() {
    return delay([
      { id: "tmp1", name: "Offer Letter · Full Time", type: "Offer", updated: "Nov 10, 2026", usage: 214 },
      { id: "tmp2", name: "Offer Letter · Contractor", type: "Offer", updated: "Oct 22, 2026", usage: 42 },
      { id: "tmp3", name: "NDA · Standard", type: "Legal", updated: "Sep 12, 2026", usage: 318 },
      { id: "tmp4", name: "Relieving Letter", type: "Exit", updated: "Aug 4, 2026", usage: 87 },
      { id: "tmp5", name: "Experience Letter", type: "Exit", updated: "Aug 4, 2026", usage: 92 },
      { id: "tmp6", name: "Promotion Letter", type: "Comp", updated: "Jul 30, 2026", usage: 63 },
    ]);
  },
};

export const complianceService = {
  async bgv(): Promise<BgvCase[]> {
    return delay(
      Array.from({ length: 12 }, (_, i) => ({
        id: `bgv_${i}`,
        employeeName: HIRES[i % HIRES.length].candidateName,
        role: HIRES[i % HIRES.length].role,
        vendor: pick(["AuthBridge","OnGrid","IDfy","HireRight"]),
        status: (["initiated","in_progress","clear","clear","discrepancy","insufficient"] as const)[i % 6],
        startedAt: `Nov ${(i % 20) + 1}`,
        completedAt: i % 3 === 0 ? `Nov ${(i % 20) + 6}` : undefined,
        checks: pickN(["Identity","Address","Education","Employment","Criminal","Reference","Credit"], 3 + (i % 3)),
      })),
    );
  },
  async contracts(): Promise<Contract[]> {
    return delay(
      Array.from({ length: 14 }, (_, i) => ({
        id: `ctr_${i}`,
        employeeName: EMPLOYEES[i * 19].name,
        type: pick(["Full-time","Fixed-term","Contractor","Intern","Consultant"]),
        startDate: `Jan ${(i % 28) + 1}, 2025`,
        endDate: `Dec ${(i % 28) + 1}, 2026`,
        status: (["active","active","expiring","expiring","expired","renewed"] as const)[i % 6],
        location: EMPLOYEES[i * 19].location,
      })),
    );
  },
  async audit(): Promise<AuditEvent[]> {
    return delay(
      Array.from({ length: 20 }, (_, i) => ({
        id: `au_${i}`,
        actor: EMPLOYEES[i].name,
        action: pick(["updated employee","approved leave","published policy","modified salary","added user","exported report"]),
        target: pick(["Priya Menon","Q4 review cycle","Travel Policy v3.2","EMP-10428","Payroll · Nov","Headcount export"]),
        module: pick(["Employees","Leave","Policies","Compensation","Users","Reports"]),
        ip: `10.${i % 250}.${(i * 3) % 250}.${(i * 7) % 250}`,
        timestamp: `Nov ${20 + (i % 10)}, ${8 + (i % 12)}:${String((i * 7) % 60).padStart(2, "0")}`,
      })),
    );
  },
  async dashboard() {
    return delay({
      openCases: 7,
      contractsExpiring: 12,
      bgvPending: 8,
      auditsThisMonth: 3,
      policyAckAvg: 94,
      alerts: [
        { severity: "high", title: "3 contracts expiring in 7 days", link: "/hr/compliance/contracts" },
        { severity: "medium", title: "BGV discrepancy · candidate #24", link: "/hr/compliance/bgv" },
        { severity: "medium", title: "Data privacy training due for 42 employees", link: "/hr/lnd/certifications" },
        { severity: "low", title: "POSH annual training scheduled Dec 5", link: "/hr/compliance/policies" },
      ],
    });
  },
};

// Employee relations & engagement --------------------------------
export const relationsService = {
  async grievances(): Promise<Grievance[]> {
    return delay(
      Array.from({ length: 9 }, (_, i) => ({
        id: `gr_${i}`,
        reportedBy: i % 3 === 0 ? "Anonymous" : EMPLOYEES[i * 23].name,
        anonymous: i % 3 === 0,
        category: pick(["Harassment","Manager","Compensation","Discrimination","Workplace Safety","Policy Violation"]),
        severity: (["low","medium","high","critical"] as const)[i % 4],
        submittedAt: `Nov ${(i % 20) + 1}`,
        assignedTo: pick(["Ethics Committee","People Ops","HRBP · Priya","Legal"]),
        status: (["open","investigating","resolved","escalated","closed"] as const)[i % 5],
        summary: pick([
          "Concerns about team culture and communication practices.",
          "Feedback around compensation parity within team.",
          "Reported inappropriate remarks during offsite.",
          "Request for accommodation for medical condition.",
        ]),
      })),
    );
  },
  async disciplinary(): Promise<DisciplinaryCase[]> {
    return delay(
      Array.from({ length: 6 }, (_, i) => ({
        id: `dc_${i}`,
        employeeName: EMPLOYEES[i * 31].name,
        department: EMPLOYEES[i * 31].department,
        category: pick(["Attendance","Performance","Policy violation","Misconduct"]),
        severity: (["verbal","written","final","termination"] as const)[i % 4],
        raisedBy: EMPLOYEES[i * 31].managerName ?? "Manager",
        raisedAt: `Nov ${(i % 20) + 1}`,
        status: (["open","review","action_taken","closed"] as const)[i % 4],
      })),
    );
  },
  async recognitions(): Promise<Recognition[]> {
    return delay(
      Array.from({ length: 14 }, (_, i) => ({
        id: `rc_${i}`,
        from: EMPLOYEES[i * 7].name,
        to: EMPLOYEES[i * 11 + 3].name,
        category: (["spot","value","milestone","peer"] as const)[i % 4],
        points: [50, 100, 200, 500][i % 4],
        message: pick([
          "For going above and beyond during launch week.",
          "Consistently exemplifies our value of customer obsession.",
          "5-year work anniversary — thank you for your impact!",
          "Peer recognition for mentorship this quarter.",
        ]),
        createdAt: `${(i % 20) + 1}d ago`,
      })),
    );
  },
};

export const engagementService = {
  async announcements(): Promise<Announcement[]> {
    return delay([
      { id: "an1", title: "Company All-Hands · Dec 5", category: "event", author: "Anjali Krishnan · CEO", audience: "All", publishedAt: "2h ago", pinned: true, reactions: 184, views: 962, excerpt: "Join us for a review of the year and 2027 strategy reveal." },
      { id: "an2", title: "Updated Remote Work Policy", category: "policy", author: "Aditya Rao · VP People", audience: "All", publishedAt: "1d ago", pinned: true, reactions: 92, views: 812, excerpt: "New guidelines around hybrid attendance and stipends." },
      { id: "an3", title: "Diwali Celebrations at Bangalore HQ", category: "celebration", author: "People Ops", audience: "Bangalore", publishedAt: "3d ago", pinned: false, reactions: 246, views: 421, excerpt: "Lunch, cultural performances and gift hampers on Nov 8." },
      { id: "an4", title: "Q4 Performance Cycle Kicks Off", category: "hr", author: "People Ops", audience: "All", publishedAt: "5d ago", pinned: false, reactions: 41, views: 632, excerpt: "Self reviews due by Nov 25. Manager reviews by Dec 10." },
      { id: "an5", title: "Welcome November Cohort (14 hires!)", category: "company", author: "Talent Team", audience: "All", publishedAt: "1w ago", pinned: false, reactions: 312, views: 894, excerpt: "Meet our newest team members joining across 6 offices." },
      { id: "an6", title: "Open Enrollment for Benefits", category: "hr", author: "Benefits Team", audience: "All", publishedAt: "1w ago", pinned: false, reactions: 62, views: 511, excerpt: "Review and update your benefits selections by Nov 30." },
    ]);
  },
  async pulseSurveys(): Promise<PulseSurvey[]> {
    return delay([
      { id: "ps1", name: "Q4 Engagement Pulse", cycle: "Q4 · 2026", sent: 1189, responded: 892, eNps: 42, status: "running", launchedAt: "Nov 15" },
      { id: "ps2", name: "Manager Effectiveness", cycle: "H2 · 2026", sent: 1156, responded: 1024, eNps: 38, status: "closed", launchedAt: "Sep 12" },
      { id: "ps3", name: "Onboarding Experience", cycle: "Rolling", sent: 84, responded: 71, eNps: 56, status: "running", launchedAt: "Ongoing" },
      { id: "ps4", name: "DEI Belonging Survey", cycle: "Annual", sent: 1189, responded: 843, eNps: 34, status: "running", launchedAt: "Nov 8" },
      { id: "ps5", name: "Exit Survey", cycle: "Rolling", sent: 62, responded: 48, eNps: 12, status: "running", launchedAt: "Ongoing" },
    ]);
  },
  async engagementTrend() {
    return delay([
      { month: "Jun", eNps: 32 }, { month: "Jul", eNps: 34 }, { month: "Aug", eNps: 36 },
      { month: "Sep", eNps: 38 }, { month: "Oct", eNps: 40 }, { month: "Nov", eNps: 42 },
    ]);
  },
};

// Learning --------------------------------------------------------
export const learningService = {
  async programs(): Promise<TrainingProgram[]> {
    return delay([
      { id: "tp1", name: "New Manager Onboarding", category: "Leadership", format: "blended", durationHrs: 24, enrolled: 82, completed: 61, rating: 4.6, status: "active", mandatory: true },
      { id: "tp2", name: "Data Privacy · GDPR", category: "Compliance", format: "self_paced", durationHrs: 2, enrolled: 1189, completed: 1042, rating: 4.2, status: "active", mandatory: true },
      { id: "tp3", name: "Prevention of Sexual Harassment", category: "Compliance", format: "instructor", durationHrs: 3, enrolled: 1189, completed: 1156, rating: 4.4, status: "active", mandatory: true },
      { id: "tp4", name: "React & Modern Frontend", category: "Technical", format: "self_paced", durationHrs: 40, enrolled: 214, completed: 132, rating: 4.7, status: "active", mandatory: false },
      { id: "tp5", name: "Consultative Selling", category: "Sales", format: "instructor", durationHrs: 16, enrolled: 68, completed: 42, rating: 4.5, status: "active", mandatory: false },
      { id: "tp6", name: "Design Thinking Workshop", category: "Design", format: "blended", durationHrs: 12, enrolled: 46, completed: 32, rating: 4.8, status: "active", mandatory: false },
      { id: "tp7", name: "Financial Acumen for Managers", category: "Business", format: "self_paced", durationHrs: 8, enrolled: 122, completed: 68, rating: 4.3, status: "active", mandatory: false },
    ]);
  },
  async certifications(): Promise<Certification[]> {
    return delay(
      Array.from({ length: 16 }, (_, i) => ({
        id: `cert_${i}`,
        employeeName: EMPLOYEES[i * 17].name,
        cert: pick(["AWS SA Professional","GCP Cloud Architect","CISSP","PMP","CSPO","CFA L1","SOC 2 Auditor","OWASP Web Security","Kubernetes CKAD","Google Analytics"]),
        issuer: pick(["AWS","Google","(ISC)²","PMI","Scrum.org","CFA Institute","AICPA","OWASP","CNCF"]),
        issued: `Jan ${(i % 28) + 1}, 202${3 + (i % 4)}`,
        expires: `Jan ${(i % 28) + 1}, 202${5 + (i % 4)}`,
        status: (["valid","valid","valid","expiring","expired"] as const)[i % 5],
      })),
    );
  },
  async skillMatrix(): Promise<SkillMatrixRow[]> {
    return delay(
      ["React","TypeScript","Python","Kubernetes","AWS","SQL","Figma","Product Strategy","Data Analysis","Leadership"].map((s, i) => ({
        skill: s,
        category: i < 6 ? "Technical" : i < 8 ? "Functional" : "Behavioral",
        beginner: 20 + (i * 7) % 40,
        intermediate: 40 + (i * 5) % 60,
        advanced: 25 + (i * 3) % 30,
        expert: 8 + (i * 11) % 22,
        gap: 5 + (i * 13) % 40,
      })),
    );
  },
  async stats() {
    return delay({
      totalPrograms: 32,
      activeLearners: 842,
      completionRate: 71,
      hoursThisMonth: 2846,
      mandatoryDue: 42,
      certsExpiring: 8,
      trend: [
        { month: "Jun", hrs: 2100 }, { month: "Jul", hrs: 2280 }, { month: "Aug", hrs: 2410 },
        { month: "Sep", hrs: 2620 }, { month: "Oct", hrs: 2740 }, { month: "Nov", hrs: 2846 },
      ],
    });
  },
};

// Analytics -------------------------------------------------------
export const analyticsService = {
  async headcount() {
    return delay({
      total: 1189,
      newHiresQtd: 96,
      exitsQtd: 42,
      internalMoves: 28,
      byDept: DEPTS.map((d, i) => ({ name: d, value: 60 + ((i * 37) % 180) })),
      byLocation: LOCS_LIST.map((l) => ({ name: l.name, value: EMPLOYEES.filter((e) => e.location === l.name).length })),
      byBand: BANDS.map((b) => ({ name: b, value: EMPLOYEES.filter((e) => e.band === b).length })),
      tenure: [
        { bucket: "< 1yr", value: 218 }, { bucket: "1–2yr", value: 342 },
        { bucket: "2–4yr", value: 356 }, { bucket: "4–7yr", value: 204 },
        { bucket: "7yr+", value: 69 },
      ],
      trend: [
        { month: "Jun", value: 1108 }, { month: "Jul", value: 1121 }, { month: "Aug", value: 1142 },
        { month: "Sep", value: 1163 }, { month: "Oct", value: 1178 }, { month: "Nov", value: 1189 },
      ],
    });
  },
  async diversity() {
    return delay({
      genderMix: [
        { name: "Women", value: 42 }, { name: "Men", value: 55 }, { name: "Non-binary/Other", value: 3 },
      ],
      leadership: [
        { name: "Women in Leadership", value: 34 }, { name: "Men in Leadership", value: 66 },
      ],
      nationalities: 24,
      ageGroups: [
        { name: "20–29", value: 342 }, { name: "30–39", value: 512 },
        { name: "40–49", value: 246 }, { name: "50+", value: 89 },
      ],
      trend: [
        { year: "2022", women: 34 }, { year: "2023", women: 36 },
        { year: "2024", women: 38 }, { year: "2025", women: 40 }, { year: "2026", women: 42 },
      ],
    });
  },
};

// Approvals (aggregated) -----------------------------------------
export interface HrApproval {
  id: string;
  type: "leave" | "expense" | "offer" | "increment" | "asset" | "promotion" | "resignation" | "requisition";
  requester: string;
  requesterDept: string;
  summary: string;
  amount?: number;
  submittedAt: string;
  age: string;
  priority: "low" | "medium" | "high";
  slaHours: number;
  slaConsumed: number;
}

export const approvalService = {
  async list(): Promise<HrApproval[]> {
    const items: HrApproval[] = Array.from({ length: 18 }, (_, i) => {
      const emp = EMPLOYEES[i * 7];
      const type = (["leave","expense","offer","increment","asset","promotion","resignation","requisition"] as const)[i % 8];
      const slaHours = [24, 48, 72][i % 3];
      return {
        id: `apr_${i}`,
        type,
        requester: emp.name,
        requesterDept: emp.department,
        summary: {
          leave: "3 days casual leave (Nov 24–26)",
          expense: "Client dinner expense · ₹18,400",
          offer: `Offer approval · ${REQ_TITLES[i % REQ_TITLES.length]}`,
          increment: "12% off-cycle increment",
          asset: "New MacBook Pro 16″",
          promotion: `Promotion recommendation · ${GRADES[i % GRADES.length]} → ${GRADES[(i % GRADES.length) + 1]}`,
          resignation: "Resignation submitted · 30-day notice",
          requisition: `New requisition · ${REQ_TITLES[i % REQ_TITLES.length]}`,
        }[type],
        amount: type === "expense" ? 18400 + i * 1200 : type === "increment" || type === "promotion" ? 850000 : undefined,
        submittedAt: `${(i % 20) + 1}h ago`,
        age: `${(i % 20) + 1}h`,
        priority: (["low","medium","high"] as const)[i % 3],
        slaHours,
        slaConsumed: Math.min(slaHours, (i * 4) % (slaHours + 8)),
      };
    });
    return delay(items);
  },
};

export const activityService = {
  async feed() {
    return delay(
      Array.from({ length: 24 }, (_, i) => ({
        id: `act_${i}`,
        actor: EMPLOYEES[i].name,
        action: pick(["hired","promoted","transferred","approved leave for","completed review of","recognized","onboarded","posted a job for","closed exit for"]),
        target: pick(["Kabir Shah","Priya Menon · Sr. Engineer","Q4 review cycle","Design team","Isha Verma","Aarav Sharma","Sales Executive · Bangalore"]),
        category: (["hire","review","policy","leave","exit","hire"] as const)[i % 6],
        time: `${(i % 24) + 1}h`,
      })),
    );
  },
};
