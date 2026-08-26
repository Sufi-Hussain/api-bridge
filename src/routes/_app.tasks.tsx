import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPatch, camelizeKeys, unwrapList, snakeizeKeys } from "@/lib/api";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks · HireChamps" },
      { name: "description", content: "Track work, ownership, and delivery across your team." },
    ],
  }),
  component: TasksPage,
});

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  assignee?: string | null;
};

type Activity = { id: string; action: string; createdAt: string };

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [comment, setComment] = useState("");
  const [assignee, setAssignee] = useState("");
  const [activity, setActivity] = useState<Activity[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiGet<any>("/api/tasks/", { params: search ? { search } : {} });
      setTasks(unwrapList<Task>(raw, (row) => camelizeKeys<Task>(row)));
    } catch {
      setError("Couldn’t load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openTask = async (task: Task) => {
    setSelected(task);
    try {
      const raw = await apiGet<any>(`/api/tasks/${task.id}/activity/`);
      setActivity(unwrapList<Activity>(raw, (row) => camelizeKeys<Activity>(row)));
    } catch {
      setActivity([]);
    }
  };

  const updateStatus = async (task: Task, status: string) => {
    try {
      await apiPatch(`/api/tasks/${task.id}/`, snakeizeKeys({ status }));
      await load();
    } catch {
      toast.error("Couldn’t update this task.");
    }
  };

  const createTask = async () => {
    try {
      await apiPost("/api/tasks/", { title: "New task", priority: "medium", status: "todo" });
      await load();
    } catch {
      toast.error("Couldn’t create a task.");
    }
  };

  const assign = async () => {
    if (!selected) return;
    try {
      await apiPatch(`/api/tasks/${selected.id}/`, snakeizeKeys({ assignee }));
      toast.success("Task assigned.");
      await load();
    } catch {
      toast.error("Couldn’t assign this task.");
    }
  };

  const addComment = async () => {
    if (!selected) return;
    try {
      await apiPost(`/api/tasks/${selected.id}/comments/`, { body: comment });
      setComment("");
      toast.success("Comment added.");
    } catch {
      toast.error("Couldn’t add this comment.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Track work, ownership, and delivery."
        breadcrumbs={[{ label: "Work" }, { label: "Tasks" }]}
        actions={<Button size="sm" onClick={() => void createTask()}>Create task</Button>}
      />

      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" />

      {error ? (
        <SectionCard title="Tasks unavailable">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title={`${tasks.length} tasks`}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : tasks.length ? (
          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <button className="text-left font-medium hover:underline" onClick={() => void openTask(task)}>
                    {task.title}
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {task.dueDate ? `Due ${task.dueDate}` : "No due date"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    tone={task.priority === "urgent" ? "destructive" : task.status === "completed" ? "success" : "info"}
                  >
                    {task.status.replace("_", " ")}
                  </StatusBadge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void updateStatus(task, task.status === "completed" ? "todo" : "completed")}
                  >
                    {task.status === "completed" ? "Reopen" : "Complete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tasks found.</p>
        )}
      </SectionCard>

      {selected ? (
        <SectionCard title={selected.title}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected.description || "No description provided."}</p>
            <div className="flex gap-2">
              <Input
                aria-label="Assignee user ID"
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
                placeholder="Assignee user ID"
              />
              <Button variant="outline" disabled={!assignee.trim()} onClick={() => void assign()}>Assign</Button>
            </div>
            {activity.length ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                {activity.map((item) => (
                  <p key={item.id}>{item.action} · {item.createdAt}</p>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" />
              <Button disabled={!comment.trim()} onClick={() => void addComment()}>Comment</Button>
            </div>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
