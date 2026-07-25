// HR Administration mock service. Realistic enterprise data for the HR module.

export interface HREmployee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  manager: string;
  employeeId: string;
  status: "active" | "on_leave" | "notice" | "probation";
  joinDate: string;
  grade: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  headcount: number;
  openPositions: number;
  budget: number;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: "sourced" | "screen" | "interview" | "offer" | "hired" | "rejected";
  rating: number;
  appliedAt: string;
  source: string;
  location: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full_time" | "contract" | "intern";
  applicants: number;
  status: "open" | "on_hold" | "closed";
  posted: string;
}

export interface OnboardingTask {
  id: string;
  employee: string;
  task: string;
  owner: string;
  dueDate: string;
  status: "todo" | "in_progress" | "done";
}

export interface ApprovalItem {
  id: string;
  type: "leave" | "expense" | "offer" | "increment" | "asset";
  requester: string;
  summary: string;
  requestedAt: string;
  priority: "low" | "medium" | "high";
}

export interface HRActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  category: "hire" | "exit" | "review" | "policy" | "leave";
}

export interface HeadcountPoint {
  month: string;
  active: number;
  new: number;
  exits: number;
}

export interface HiringFunnelStage {
  stage: string;
  count: number;
}

export interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  reports?: OrgNode[];
}

async function delay<T>(v: T, ms = 200): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

const FIRST = ["Aarav", "Priya", "Rohan", "Meera", "Ishaan", "Zara", "Kabir", "Anaya", "Vihaan", "Diya", "Arjun", "Sara", "Neel", "Riya", "Aditya", "Kiara", "Yash", "Nisha", "Dev", "Aisha"];
const LAST = ["Sharma", "Patel", "Verma", "Iyer", "Khan", "Reddy", "Nair", "Kapoor", "Mehta", "Gupta", "Singh", "Bose", "Rao", "Joshi", "Malhotra"];
const DEPTS = ["Engineering", "Design", "Product", "Marketing", "Sales", "People", "Finance", "Operations", "Support", "Legal"];
const LOCS = ["Bangalore", "Mumbai", "New York", "London", "Berlin", "Singapore", "Remote"];
const GRADES = ["L2", "L3", "L4", "L5", "M1", "M2", "D1"];
const TITLES = [
  "Software Engineer",
  "Senior Engineer",
  "Product Designer",
  "Engineering Manager",
  "Product Manager",
  "Data Analyst",
  "Marketing Lead",
  "Sales Executive",
  "HR Business Partner",
  "Finance Analyst",
  "Operations Specialist",
  "Support Engineer",
];

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededEmployees(count: number): HREmployee[] {
  const list: HREmployee[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 3) % LAST.length];
    const name = `${first} ${last}`;
    const dept = DEPTS[i % DEPTS.length];
    list.push({
      id: `hre_${1000 + i}`,
      name,
      email: `${first}.${last}`.toLowerCase() + "@acme.com",
      jobTitle: TITLES[i % TITLES.length],
      department: dept,
      location: LOCS[i % LOCS.length],
      manager: `${FIRST[(i + 5) % FIRST.length]} ${LAST[(i + 2) % LAST.length]}`,
      employeeId: `EMP-${10000 + i}`,
      status:
        i % 17 === 0 ? "on_leave" : i % 23 === 0 ? "notice" : i % 11 === 0 ? "probation" : "active",
      joinDate: new Date(2020 + (i % 5), i % 12, 1 + (i % 27)).toISOString().slice(0, 10),
      grade: GRADES[i % GRADES.length],
    });
  }
  return list;
}

const EMPLOYEES = seededEmployees(64);

export const hrService = {
  async getStats() {
    return delay({
      headcount: 1247,
      activeEmployees: 1189,
      newJoiners: 34,
      openPositions: 52,
      candidatesInPipeline: 218,
      pendingApprovals: 17,
      onLeaveToday: 41,
      attendanceRate: 94.2,
      attritionYtd: 8.4,
      upcomingConfirmations: 12,
      birthdaysThisWeek: 8,
      workAnniversaries: 15,
      pendingReviews: 42,
      learningCompletion: 71,
      complianceAlerts: 4,
    });
  },

  async getHeadcountTrend(): Promise<HeadcountPoint[]> {
    return delay([
      { month: "Jun", active: 1108, new: 22, exits: 9 },
      { month: "Jul", active: 1121, new: 26, exits: 13 },
      { month: "Aug", active: 1142, new: 31, exits: 10 },
      { month: "Sep", active: 1163, new: 28, exits: 7 },
      { month: "Oct", active: 1178, new: 22, exits: 7 },
      { month: "Nov", active: 1189, new: 34, exits: 23 },
    ]);
  },

  async getDepartmentDistribution() {
    return delay(
      DEPTS.map((d, i) => ({
        name: d,
        value: 60 + ((i * 37) % 180),
      })),
    );
  },

  async getHiringFunnel(): Promise<HiringFunnelStage[]> {
    return delay([
      { stage: "Sourced", count: 480 },
      { stage: "Screened", count: 264 },
      { stage: "Interview", count: 128 },
      { stage: "Offer", count: 38 },
      { stage: "Hired", count: 21 },
    ]);
  },

  async getEmployees(): Promise<HREmployee[]> {
    return delay(EMPLOYEES);
  },

  async getDepartments(): Promise<Department[]> {
    return delay(
      DEPTS.map((d, i) => ({
        id: `dept_${i}`,
        name: d,
        head: `${FIRST[i]} ${LAST[i % LAST.length]}`,
        headcount: 60 + ((i * 37) % 180),
        openPositions: (i * 3) % 12,
        budget: 250_000 + i * 42_000,
      })),
    );
  },

  async getCandidates(): Promise<Candidate[]> {
    const stages: Candidate["stage"][] = ["sourced", "screen", "interview", "offer", "hired", "rejected"];
    const roles = ["Senior Engineer", "Product Designer", "Data Scientist", "Sales Lead", "HR BP"];
    return delay(
      Array.from({ length: 24 }, (_, i) => ({
        id: `cand_${i}`,
        name: `${FIRST[i % FIRST.length]} ${LAST[(i + 4) % LAST.length]}`,
        role: roles[i % roles.length],
        stage: stages[i % stages.length],
        rating: 3 + ((i * 7) % 20) / 10,
        appliedAt: `${(i % 28) + 1} Nov`,
        source: rand(["LinkedIn", "Referral", "Careers page", "Naukri", "Agency"]),
        location: LOCS[i % LOCS.length],
      })),
    );
  },

  async getJobOpenings(): Promise<JobOpening[]> {
    return delay(
      Array.from({ length: 12 }, (_, i) => ({
        id: `job_${i}`,
        title: TITLES[i % TITLES.length],
        department: DEPTS[i % DEPTS.length],
        location: LOCS[i % LOCS.length],
        type: (["full_time", "contract", "intern"] as const)[i % 3],
        applicants: 8 + ((i * 13) % 84),
        status: (["open", "on_hold", "closed"] as const)[i % 4 === 3 ? 1 : 0],
        posted: `${(i % 28) + 1} days ago`,
      })),
    );
  },

  async getOnboardingTasks(): Promise<OnboardingTask[]> {
    const tasks = [
      "Collect ID proof",
      "Assign laptop",
      "Set up email",
      "Buddy assignment",
      "Orientation session",
      "Sign NDA",
      "Bank details",
      "Emergency contacts",
    ];
    return delay(
      Array.from({ length: 12 }, (_, i) => ({
        id: `onb_${i}`,
        employee: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
        task: tasks[i % tasks.length],
        owner: rand(["HR Ops", "IT", "Finance", "Manager"]),
        dueDate: `Nov ${18 + (i % 10)}`,
        status: (["todo", "in_progress", "done"] as const)[i % 3],
      })),
    );
  },

  async getApprovals(): Promise<ApprovalItem[]> {
    const types: ApprovalItem["type"][] = ["leave", "expense", "offer", "increment", "asset"];
    return delay(
      Array.from({ length: 8 }, (_, i) => ({
        id: `apr_${i}`,
        type: types[i % types.length],
        requester: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
        summary: [
          "3 days casual leave (Nov 24–26)",
          "Client dinner expense · $184",
          "Offer approval · Sr. Engineer",
          "12% increment recommendation",
          "New MacBook Pro request",
        ][i % 5],
        requestedAt: `${(i % 8) + 1}h ago`,
        priority: (["low", "medium", "high"] as const)[i % 3],
      })),
    );
  },

  async getActivities(): Promise<HRActivity[]> {
    return delay([
      { id: "a1", actor: "Priya Menon", action: "hired", target: "Kabir Shah as Sr. Engineer", time: "12m", category: "hire" },
      { id: "a2", actor: "Rohan Iyer", action: "submitted review for", target: "Q4 cycle · Design team", time: "1h", category: "review" },
      { id: "a3", actor: "HR Ops", action: "published", target: "Updated Travel Policy v3.2", time: "3h", category: "policy" },
      { id: "a4", actor: "Meera Kapoor", action: "approved", target: "5 leave requests", time: "5h", category: "leave" },
      { id: "a5", actor: "System", action: "closed exit for", target: "Ishaan Verma", time: "1d", category: "exit" },
      { id: "a6", actor: "Aditya Rao", action: "moved to offer stage", target: "Zara Khan · Product Designer", time: "1d", category: "hire" },
    ]);
  },

  async getUpcomingEvents() {
    return delay([
      { id: "e1", title: "Riya Nair · Work anniversary (3y)", date: "Tomorrow", tag: "anniversary" as const },
      { id: "e2", title: "Confirmation review · Neel Bose", date: "Nov 22", tag: "confirmation" as const },
      { id: "e3", title: "Q4 cycle closes", date: "Nov 30", tag: "cycle" as const },
      { id: "e4", title: "Aisha Rao · Birthday", date: "Nov 21", tag: "birthday" as const },
      { id: "e5", title: "Diversity report due", date: "Dec 05", tag: "report" as const },
    ]);
  },

  async getOrgTree(): Promise<OrgNode> {
    return delay({
      id: "n0",
      name: "Anjali Krishnan",
      title: "Chief Executive Officer",
      department: "Executive",
      reports: [
        {
          id: "n1",
          name: "Priya Menon",
          title: "VP Engineering",
          department: "Engineering",
          reports: [
            { id: "n1a", name: "Rohan Iyer", title: "Director, Platform", department: "Engineering" },
            { id: "n1b", name: "Meera Kapoor", title: "Director, Product Eng", department: "Engineering" },
          ],
        },
        {
          id: "n2",
          name: "Ishaan Verma",
          title: "VP Product",
          department: "Product",
          reports: [
            { id: "n2a", name: "Zara Khan", title: "Head of Design", department: "Design" },
            { id: "n2b", name: "Kabir Shah", title: "Group PM", department: "Product" },
          ],
        },
        {
          id: "n3",
          name: "Aditya Rao",
          title: "VP People",
          department: "People",
          reports: [
            { id: "n3a", name: "Diya Nair", title: "Head of Talent", department: "People" },
            { id: "n3b", name: "Yash Bose", title: "Head of Rewards", department: "People" },
          ],
        },
      ],
    });
  },
};
