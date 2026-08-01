import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Briefcase, Calendar, Camera, GraduationCap, Mail, MapPin, Pencil, Phone, ShieldAlert, Users, Award, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { essService, type EmployeeProfile } from "@/services/ess";

export const Route = createFileRoute("/_app/profile/personal")({
  head: () => ({
    meta: [
      { title: "My Profile · Meridian HR" },
      { name: "description", content: "Personal information, employment details, family and skills." },
      { property: "og:title", content: "My Profile · Meridian HR" },
    ],
  }),
  component: ProfilePage,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-border/50 py-2.5 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="col-span-2 text-sm">{value}</span>
    </div>
  );
}

function ProfilePage() {
  const [p, setP] = useState<EmployeeProfile | null>(null);
  useEffect(() => { essService.getProfile().then(setP); }, []);

  if (!p) return null;
  const completion = 82;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Your personal, employment and family information — kept in sync with HR."
        breadcrumbs={[{ label: "Me" }, { label: "Profile" }]}
        actions={<Button size="sm"><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit profile</Button>}
      />

      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <PersonAvatar name={`${p.firstName} ${p.lastName}`} size="lg" />
              <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent" aria-label="Update photo">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{p.firstName} {p.lastName}</h2>
                <StatusBadge tone="success">Active</StatusBadge>
              </div>
              {/* <p className="text-sm text-muted-foreground">{p.employment.jobTitle} · {p.employment.department} · {p.employeeId}</p> */}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {p.workEmail}</span>
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {p.mobile}</span>
                {/* <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.employment.location}</span> */}
              </div>
            </div>
          </div>
          <div className="w-full md:w-72">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium">Profile completion</span>
              <span className="text-muted-foreground">{completion}%</span>
            </div>
            <Progress value={completion} className="h-1.5" />
            <p className="mt-2 text-[11px] text-muted-foreground">Add nominee details, work phone and profile photo to reach 100%.</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="family">Family & Emergency</TabsTrigger>
          <TabsTrigger value="education">Education & Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Basic details">
            <Row label="Full name" value={`${p.firstName} ${p.lastName}`} />
            <Row label="Preferred name" value={p.preferredName ?? "—"} />
            <Row label="Date of birth" value={new Date(p.dob).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} />
            <Row label="Gender" value={<span className="capitalize">{p.gender.replace("-", " ")}</span>} />
            <Row label="Marital status" value={<span className="capitalize">{p.maritalStatus}</span>} />
            <Row label="Nationality" value={p.nationality} />
            <Row label="Blood group" value={p.bloodGroup} />
          </SectionCard>
          <SectionCard title="Contact & address">
            <Row label="Work email" value={p.workEmail} />
            <Row label="Personal email" value={p.personalEmail} />
            <Row label="Mobile" value={p.mobile} />
            <Row label="Work phone" value={p.workPhone ?? "—"} />
            {/* <Row label="Address" value={<span>{p.address.line1}{p.address.line2 ? `, ${p.address.line2}` : ""}, {p.address.city}, {p.address.state} {p.address.postal}, {p.address.country}</span>} /> */}
          </SectionCard>
        </TabsContent>

        <TabsContent value="employment" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Position">
            <Row label="Job title" value={p.employment.jobTitle} />
            <Row label="Department" value={<span className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> {p.employment.department}</span>} />
            <Row label="Grade / band" value={p.employment.grade} />
            <Row label="Employment type" value={<span className="capitalize">{p.employment.employmentType.replace("-", " ")}</span>} />
            <Row label="Work mode" value={<StatusBadge tone="info">{p.employment.workMode}</StatusBadge>} />
            {/* <Row label="Location" value={<span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {p.employment.location}</span>} /> */}
          </SectionCard>
          <SectionCard title="Reporting & timeline">
            <Row label="Manager" value={<span className="inline-flex items-center gap-2"><PersonAvatar name={p.employment.manager.name} size="xs" /> {p.employment.manager.name} · {p.employment.manager.title}</span>} />
            <Row label="Join date" value={<span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(p.employment.joinDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</span>} />
            <Row label="Tenure" value={p.employment.tenure} />
            <Row label="Business unit" value={p.employment.businessUnit} />
            <Row label="Cost center" value={p.employment.costCenter} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="family" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Emergency contacts" action={<Button variant="ghost" size="sm">Add</Button>}>
            <ul className="space-y-3">
              {p.emergency.map((e) => (
                <li key={e.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><ShieldAlert className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{e.name}</p>
                      {e.primary && <StatusBadge tone="success">Primary</StatusBadge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{e.relation} · {e.phone}{e.email ? ` · ${e.email}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Family members" action={<Button variant="ghost" size="sm">Add</Button>}>
            <ul className="space-y-3">
              {p.family.map((f) => (
                <li key={f.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2"><Users className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.relation} · Born {new Date(f.dob).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {f.dependent && <StatusBadge tone="info">Dependent</StatusBadge>}
                    {f.covered && <StatusBadge tone="success">Insured</StatusBadge>}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="education" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="Education">
            <ul className="space-y-4">
              {p.education.map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{e.degree} · {e.field}</p>
                    <p className="text-xs text-muted-foreground">{e.institution}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{e.from} – {e.to}{e.grade ? ` · ${e.grade}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Experience">
            <ul className="space-y-4">
              {p.experience.map((x) => (
                <li key={x.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-chart-3/15 text-chart-3"><Briefcase className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{x.role} · {x.company}</p>
                    <p className="text-[11px] text-muted-foreground">{x.from} – {x.to} · {x.location}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{x.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <SectionCard title="Skills & endorsements" action={<Button variant="outline" size="sm"><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Suggest skills</Button>}>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {p.skills.map((s) => (
                <li key={s.name} className="rounded-lg border border-border/60 bg-card p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">{s.name}</p>
                    <StatusBadge tone="muted">{s.endorsed} endorsed</StatusBadge>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={"h-1.5 flex-1 rounded-full " + (i < s.level ? "bg-primary" : "bg-muted")} />
                    ))}
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Award className="h-3 w-3" /> Level {s.level} of 5</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
