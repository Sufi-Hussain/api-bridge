import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Send, Paperclip, Info } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { essService } from "@/services/ess";

export const Route = createFileRoute("/_app/leave/apply")({
  head: () => ({
    meta: [
      { title: "Apply for Leave · HireChamps" },
      { name: "description", content: "Submit a new leave request. Automated approval workflow with instant visibility." },
      { property: "og:title", content: "Apply for Leave" },
    ],
  }),
  component: ApplyLeavePage,
});

const schema = z.object({
  type: z.string().min(1, "Select a leave type"),
  from: z.string().min(1, "Start date is required"),
  to: z.string().min(1, "End date is required"),
  reason: z.string().trim().min(10, "Please share at least 10 characters").max(500),
  contact: z.string().max(120).optional(),
}).refine((v) => new Date(v.to) >= new Date(v.from), { message: "End date must be after start", path: ["to"] });

type FormValues = z.infer<typeof schema>;

function daysBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return Math.max(0, Math.floor(d) + 1);
}

function ApplyLeavePage() {
  const navigate = useNavigate();
  const [balances, setBalances] = useState<{ type: string; total: number; used: number }[]>([]);
  useEffect(() => { essService.getLeaveBalances().then(setBalances); }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "", from: "", to: "", reason: "", contact: "" },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
  const values = watch();
  const days = daysBetween(values.from, values.to);
  const selected = balances.find((b) => b.type === values.type);
  const remaining = selected ? selected.total - selected.used : 0;

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`Leave request submitted`, { description: `${data.type} · ${days} day${days === 1 ? "" : "s"} · pending Priya Iyer` });
    navigate({ to: "/leave/history" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Choose the leave type, pick dates and share a short reason. Your manager will be notified instantly."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Leave" }, { label: "Apply" }]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2">
          <SectionCard title="New leave request">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Leave type</Label>
                <Select value={values.type} onValueChange={(v) => setValue("type", v, { shouldValidate: true })}>
                  <SelectTrigger id="type" className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {balances.map((b) => (
                      <SelectItem key={b.type} value={b.type}>{b.type} — {b.total - b.used} of {b.total} available</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="from" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">From</Label>
                  <Input id="from" type="date" {...register("from")} className="mt-1.5" />
                  {errors.from && <p className="mt-1 text-xs text-destructive">{errors.from.message}</p>}
                </div>
                <div>
                  <Label htmlFor="to" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">To</Label>
                  <Input id="to" type="date" {...register("to")} className="mt-1.5" />
                  {errors.to && <p className="mt-1 text-xs text-destructive">{errors.to.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="reason" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason</Label>
                <Textarea id="reason" rows={4} placeholder="Briefly describe the reason for leave…" {...register("reason")} className="mt-1.5" />
                {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
              </div>

              <div>
                <Label htmlFor="contact" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Emergency contact (optional)</Label>
                <Input id="contact" placeholder="Phone or email while on leave" {...register("contact")} className="mt-1.5" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                <Button type="button" variant="outline" size="sm"><Paperclip className="mr-1.5 h-3.5 w-3.5" /> Attach documents</Button>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm">Save draft</Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}><Send className="mr-1.5 h-3.5 w-3.5" /> Submit request</Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </form>

        <div className="space-y-4">
          <SectionCard title="Request summary">
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Days requested</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{days}</p>
                <p className="text-[11px] text-muted-foreground">{values.type || "Select a leave type"}</p>
              </div>
              {selected && (
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Balance after request</span>
                    <span className="font-medium">{Math.max(0, remaining - days)} of {selected.total}</span>
                  </div>
                  <Progress value={((remaining - days) / selected.total) * 100} className="h-1.5" />
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Approver</p>
                <p className="mt-1 text-sm font-medium">Priya Iyer</p>
                <p className="text-[11px] text-muted-foreground">Design Director · usually approves within 6 hours</p>
              </div>
              <StatusBadge tone="info">Auto-notified on submit</StatusBadge>
            </div>
          </SectionCard>

          <SectionCard title="Policy reminders">
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><Info className="mt-0.5 h-3.5 w-3.5 text-primary" /> Apply at least 48 hours in advance where possible.</li>
              <li className="flex items-start gap-2"><Info className="mt-0.5 h-3.5 w-3.5 text-primary" /> Sick leave over 2 days requires a medical certificate.</li>
              <li className="flex items-start gap-2"><Info className="mt-0.5 h-3.5 w-3.5 text-primary" /> Comp-off must be availed within 60 days of accrual.</li>
              <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-3.5 w-3.5 text-primary" /> Weekends and public holidays don't count toward leave days.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
