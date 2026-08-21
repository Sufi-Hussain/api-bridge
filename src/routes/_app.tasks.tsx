import { useEffect, useState } from "react";
import { PageHeader, SectionCard, StatusBadge, Button, Input } from "@/components";
import { apiGet, apiPatch, apiPost, camelizeKeys, unwrapList, snakeizeKeys } from "@/lib/api";
import { toast } from "sonner";

type Task = { id: string; title: string; description?: string; status: string; priority: string; dueDate?: string | null };
type Activity = { id: string; action: string; createdAt: string };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [comment, setComment] = useState("");
  const [working, setWorking] = useState(false);
  const [assignee, setAssignee] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiGet<unknown>("/api/tasks/", { params: search ? { search } : undefined });
      setTasks(unwrapList<Task>(raw, (row) => camelizeKeys<Task>(row)));
    } catch {
      setError("Couldn’t load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [search]);

  const openTask = async (task: Task) => {
    setSelected(task);
    try {
      const raw = await apiGet<unknown>(`/api/tasks/${task.id}/activity/`);
      setActivity(unwrapList<Activity>(raw, (row) => camelizeKeys<Activity>(row)));
    } catch { setActivity([]); }
  };

  const updateStatus = async (task: Task) => {
    setWorking(true);
    try {
      await apiPatch(`/api/tasks/${task.id}/`, snakeizeKeys({ status: task.status === "completed" ? "todo" : "completed" }));
      await load();
      toast.success(task.status === "completed" ? "Task reopened." : "Task completed.");
    } catch { toast.error("Couldn’t update the task."); } finally { setWorking(false); }
  };

  const createTask = async () => {
    setWorking(true);
    try { await apiPost("/api/tasks/", { title: "New task", priority: "medium", status: "todo" }); await load(); toast.success("Task created."); }
    catch { toast.error("Couldn’t create the task."); } finally { setWorking(false); }
  };

  const assignTask = async () => {
    if (!selected || !assignee.trim()) return;
    setWorking(true);
    try { await apiPatch(`/api/tasks/${selected.id}/`, { assignee: assignee.trim() }); await load(); setSelected((current) => current ? { ...current, assignee: assignee.trim() } : current); toast.success("Task assigned."); }
    catch { toast.error("Couldn’t assign the task."); } finally { setWorking(false); }
  };

  const addComment = async () => {
    if (!selected || !comment.trim()) return;
    setWorking(true);
    try { await apiPost(`/api/tasks/${selected.id}/comments/`, { body: comment.trim() }); setComment(""); toast.success("Comment added."); }
    catch { toast.error("Couldn’t add the comment."); } finally { setWorking(false); }
  };

  return (
    <main className="space-y-6">
      <PageHeader title="Tasks" description="Track work, ownership, and delivery." actions={<Button onClick={() => void createTask()} disabled={working}>Create task</Button>} />
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" />
      {error ? <SectionCard title="Tasks unavailable"><div className="flex items-center justify-between gap-4"><span>{error}</span><Button variant="outline" onClick={() => void load()}>Retry</Button></div></SectionCard> : null}
      <SectionCard title={`${tasks.length} tasks`}>
        {loading ? <p className="text-sm text-muted-foreground">Loading tasks…</p> : tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks found.</p> : <div className="divide-y">{tasks.map((task) => <div key={task.id} className="flex items-center justify-between gap-4 py-4"><div><button className="text-left font-medium hover:underline" onClick={() => void openTask(task)}>{task.title}</button><p className="text-sm text-muted-foreground">{task.dueDate ? `Due ${task.dueDate}` : "No due date"}</p></div><div className="flex items-center gap-3"><StatusBadge tone={task.status === "completed" ? "success" : task.priority === "urgent" ? "destructive" : "info"}>{task.status.replace("_", " ")}</StatusBadge><Button size="sm" variant="outline" disabled={working} onClick={() => void updateStatus(task)}>{task.status === "completed" ? "Reopen" : "Complete"}</Button></div></div>)}</div>}
      </SectionCard>
      {selected ? <SectionCard title={selected.title}><div className="space-y-4"><p className="text-sm text-muted-foreground">{selected.description || "No description provided."}</p><div className="flex gap-2"><Input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Assignee user ID" aria-label="Assignee user ID" /><Button variant="outline" disabled={working || !assignee.trim()} onClick={() => void assignTask()}>Assign</Button></div>{activity.length ? <div className="space-y-1 text-xs text-muted-foreground">{activity.map((item) => <p key={item.id}>{item.action} · {item.createdAt}</p>)}</div> : null}<div className="flex gap-2"><Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" aria-label="Add a comment" /><Button disabled={working || !comment.trim()} onClick={() => void addComment()}>Comment</Button></div><Button variant="outline" onClick={() => setSelected(null)}>Close</Button></div></SectionCard> : null}
    </main>
  );
}
