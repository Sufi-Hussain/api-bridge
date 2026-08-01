// Mock data + a tiny "service" facade. Real HTTP calls plug in here later.
import type { User } from "@/types";

export interface AttendanceDay {
  date: string;
  status: "present" | "absent" | "leave" | "holiday" | "weekend";
  hours: number;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
}

export interface Payslip {
  id: string;
  month: string;
  gross: number;
  net: number;
  status: "paid" | "processing";
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  tag: "company" | "team" | "policy";
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: "leave" | "payroll" | "system" | "team";
}

export interface Holiday {
  date: string;
  name: string;
  type: "public" | "restricted";
}

async function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export const mockService = {
  async getMe(): Promise<User> {
    return delay({
      id: "usr_001",
      name: "Aarav Sharma",
      email: "aarav.sharma@acme.com",
      jobTitle: "Senior Product Designer",
      department: "Design",
      employeeId: "EMP-10428",
      roles: ["employee"],
      permissions: [],
      organizationId: "org_acme",
    });
  },

  async getAttendanceThisMonth(): Promise<AttendanceDay[]> {
    const days: AttendanceDay[] = [];
    const now = new Date();
    for (let d = 1; d <= now.getDate(); d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const dow = date.getDay();
      const iso = date.toISOString().slice(0, 10);
      if (dow === 0 || dow === 6) {
        days.push({ date: iso, status: "weekend", hours: 0 });
      } else {
        days.push({
          date: iso,
          status: Math.random() > 0.1 ? "present" : "leave",
          hours: 8 + (Math.random() - 0.5),
        });
      }
    }
    return delay(days);
  },

  async getLeaveBalances(): Promise<LeaveBalance[]> {
    return delay([
      { type: "Casual", total: 12, used: 4 },
      { type: "Sick", total: 10, used: 2 },
      { type: "Earned", total: 20, used: 6 },
      { type: "Comp Off", total: 4, used: 1 },
    ]);
  },

  async getPayslips(): Promise<Payslip[]> {
    const months = [
      "November 2025",
      "October 2025",
      "September 2025",
      "August 2025",
      "July 2025",
      "June 2025",
    ];
    return delay(
      months.map((m, i) => ({
        id: `ps_${i}`,
        month: m,
        gross: 9800 + Math.round(Math.random() * 400),
        net: 7800 + Math.round(Math.random() * 300),
        status: i === 0 ? "processing" : "paid",
      })),
    );
  },

  async getAnnouncements(): Promise<Announcement[]> {
    return delay([
      {
        id: "a1",
        title: "New wellness benefit rolling out",
        body: "Starting next month, all employees can claim a $600 annual wellness allowance.",
        author: "People Team",
        date: "2 hours ago",
        tag: "company",
      },
      {
        id: "a2",
        title: "Q4 all-hands scheduled",
        body: "Join us on Friday at 4pm for the quarterly all-hands and product roadmap review.",
        author: "CEO Office",
        date: "Yesterday",
        tag: "company",
      },
      {
        id: "a3",
        title: "Updated travel policy",
        body: "Please review the updated international travel and per-diem policy in the KB.",
        author: "Finance",
        date: "3 days ago",
        tag: "policy",
      },
    ]);
  },

  async getTasks(): Promise<TaskItem[]> {
    return delay([
      { id: "t1", title: "Submit October timesheet", dueDate: "Today", priority: "high", status: "todo" },
      { id: "t2", title: "Approve design review for Atlas", dueDate: "Tomorrow", priority: "medium", status: "in_progress" },
      { id: "t3", title: "Complete security training", dueDate: "Nov 22", priority: "medium", status: "todo" },
      { id: "t4", title: "Update emergency contacts", dueDate: "Nov 28", priority: "low", status: "todo" },
    ]);
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return delay([
      { id: "n1", title: "Leave approved", description: "Your leave for Nov 24–25 has been approved by Priya.", time: "5m", read: false, category: "leave" },
      { id: "n2", title: "Payslip available", description: "Your October payslip is ready to download.", time: "1h", read: false, category: "payroll" },
      { id: "n3", title: "New device policy", description: "IT updated the acceptable use policy.", time: "1d", read: true, category: "system" },
      { id: "n4", title: "Kickoff reminder", description: "Atlas project kickoff at 3pm today.", time: "1d", read: true, category: "team" },
    ]);
  },

  async getHolidays(): Promise<Holiday[]> {
    return delay([
      { date: "Dec 25, 2025", name: "Christmas Day", type: "public" },
      { date: "Jan 1, 2026", name: "New Year's Day", type: "public" },
      { date: "Jan 26, 2026", name: "Republic Day", type: "public" },
      { date: "Mar 14, 2026", name: "Holi", type: "restricted" },
    ]);
  },
};
