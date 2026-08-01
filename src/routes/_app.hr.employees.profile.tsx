import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Briefcase, Calendar, Award, TrendingUp, FileText, DollarSign, Users, Edit } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Timeline } from "@/components/common/timeline";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { employeeService, type Employee } from "@/services/hr";

export const Route = createFileRoute("/_app/hr/employees/profile")({
  head: () => ({
    meta: [
      { title: "Employee Profile · HireChamps" },
      { name: "description", content: "Comprehensive employee record — personal, employment, compensation, performance and history." },
      { property: "og:title", content: "Employee Profile · HireChamps" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [emp, setEmp] = useState<Employee | null>(null);

  useEffect(() => { employeeService.list().then((l) => setEmp(l[3])); }, []);

  if (!emp) return null;

  const detail = (label: string, value: string) => (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Profile"
        breadcrumbs={[{ label: "HR" }, { label: "Employees" }, { label: emp.name }]}
        actions={<Button size="sm"><Edit className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>}
      />

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <PersonAvatar name={emp.name} className="h-20 w-20 text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">{emp.name}</h2>
              <StatusBadge tone="success">{emp.status.replace("_", " ")}</StatusBadge>
              <StatusBadge tone="muted">{emp.grade}</StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{emp.jobTitle} · {emp.department} · {emp.team}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {emp.email}</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {emp.phone}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {emp.location}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <div className="rounded-lg border border-border/60 bg-card/70 p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Tenure</p>
              <p className="text-lg font-semibold">{Math.floor(emp.tenureMonths / 12)}y {emp.tenureMonths % 12}m</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/70 p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Rating</p>
              <p className="text-lg font-semibold">{emp.performanceRating}.0 / 5</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-3">
          <SectionCard title="Personal information" className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {detail("Employee code", emp.empCode)}
              {detail("Full name", emp.name)}
              {detail("Email", emp.email)}
              {detail("Phone", emp.phone)}
              {detail("Gender", emp.gender)}
              {detail("Date of birth", emp.dob)}
              {detail("Location", emp.location)}
              {detail("Country", emp.country)}
              {detail("Manager", emp.managerName ?? "—")}
            </div>
          </SectionCard>
          <SectionCard title="Quick stats">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Reports</span><span className="font-semibold">4</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Leave taken YTD</span><span className="font-semibold">14 / 24</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Learning hours</span><span className="font-semibold">42h</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Attendance</span><span className="font-semibold">96%</span></div>
            </div>
          </SectionCard>

          <SectionCard title="Skills" className="lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              {emp.skills.map((s) => <StatusBadge key={s} tone="info">{s}</StatusBadge>)}
              <Button variant="outline" size="sm" className="h-6 text-xs">+ Add</Button>
            </div>
          </SectionCard>
          <SectionCard title="Emergency contact">
            <div className="space-y-1 text-sm">
              <p className="font-medium">Sunita Sharma</p>
              <p className="text-muted-foreground">Mother · +91 98450 12345</p>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="employment" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Current role">
            <div className="grid grid-cols-2 gap-4">
              {detail("Job title", emp.jobTitle)}
              {detail("Department", emp.department)}
              {detail("Team", emp.team)}
              {detail("Employment type", emp.employmentType.replace("_", " "))}
              {detail("Grade", emp.grade)}
              {detail("Band", emp.band)}
              {detail("Manager", emp.managerName ?? "—")}
              {detail("Join date", emp.joinDate)}
            </div>
          </SectionCard>
          <SectionCard title="Reporting structure">
            <Timeline events={[
              { id: "1", title: <>Anjali Krishnan <span className="text-muted-foreground">· CEO</span></>, icon: Users, tone: "info" },
              { id: "2", title: <>{emp.managerName ?? "—"} <span className="text-muted-foreground">· Manager</span></>, icon: Users, tone: "info" },
              { id: "3", title: <><span className="font-medium">{emp.name}</span> <span className="text-muted-foreground">· {emp.jobTitle}</span></>, icon: Users, tone: "success" },
            ]} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="compensation" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Current compensation">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base salary</span>
                <span className="text-lg font-semibold">{emp.currency} {emp.salaryBase.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-sm text-muted-foreground">Variable pay (target)</span>
                <span className="text-sm font-medium">{emp.currency} {Math.round(emp.salaryBase * 0.15).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock (RSU value)</span>
                <span className="text-sm font-medium">{emp.currency} {Math.round(emp.salaryBase * 0.4).toLocaleString()}</span>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Position in band">
            <p className="mb-2 text-sm text-muted-foreground">Grade {emp.grade} · 62nd percentile</p>
            <Progress value={62} className="h-2" />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>Min</span><span>Mid</span><span>Max</span>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <SectionCard title="Rating history">
            <div className="grid gap-3 sm:grid-cols-4">
              {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
                <div key={q} className="rounded-lg border border-border/60 p-4 text-center">
                  <p className="text-xs text-muted-foreground">{q} 2026</p>
                  <p className="mt-1 text-2xl font-semibold">{3 + ((i + 1) % 3)}.{i}</p>
                  <StatusBadge tone={i === 3 ? "success" : "info"}>{i === 3 ? "Exceeds" : "Meets"}</StatusBadge>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SectionCard title="Documents on file">
            <ul className="divide-y divide-border/60">
              {["Offer letter", "Employment contract", "ID proof (PAN)", "Address proof", "Educational certificates", "Previous employment", "NDA", "Bank details"].map((d) => (
                <li key={d} className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-muted-foreground" /> {d}</span>
                  <StatusBadge tone="success">Verified</StatusBadge>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <SectionCard title="Employment timeline">
            <Timeline events={[
              { id: "1", title: <>Joined as <b>{emp.jobTitle}</b></>, meta: emp.department, time: emp.joinDate, icon: Briefcase, tone: "success" },
              { id: "2", title: "Confirmed after probation", time: "3 months later", icon: Award, tone: "success" },
              { id: "3", title: "First promotion → Senior", time: "18 months later", icon: TrendingUp, tone: "info" },
              { id: "4", title: "Q3 2026 performance review", meta: "Rating: Exceeds", time: "Oct 2026", icon: Calendar, tone: "info" },
              { id: "5", title: "Compensation revision · +14%", time: "Jan 2027", icon: DollarSign, tone: "success" },
            ]} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
