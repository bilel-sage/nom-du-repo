"use client";

import { useState } from "react";
import {
  useAgendaStore,
  AGENDA_DAYS,
  type AgendaType,
  type AgendaTask,
} from "@/stores/use-agenda-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays, Plus, Trash2, Check, Pencil, GraduationCap, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Time slots every 30 min from 05:00 to 23:30
const TIME_SLOTS: string[] = [];
for (let h = 5; h <= 23; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 23) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

// ─── Add Task Dialog ──────────────────────────────────────────────────────────
function AddTaskDialog({
  open,
  onClose,
  agenda,
  day,
  dayLabel,
}: {
  open: boolean;
  onClose: () => void;
  agenda: AgendaType;
  day: number;
  dayLabel: string;
}) {
  const addTask = useAgendaStore((s) => s.addTask);
  const [text, setText] = useState("");
  const [time, setTime] = useState("none");

  const submit = () => {
    if (!text.trim()) return;
    addTask(agenda, day, text, time === "none" ? undefined : time);
    setText("");
    setTime("none");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter une tâche — {dayLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Tâche</Label>
            <Input
              autoFocus
              placeholder="Ex: Révision mathématiques"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </div>
          <div className="space-y-2">
            <Label>Heure (optionnel)</Label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="none">— Sans heure —</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={submit} disabled={!text.trim()}>Ajouter</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Task Dialog ─────────────────────────────────────────────────────────
function EditTaskDialog({
  open,
  onClose,
  agenda,
  day,
  task,
}: {
  open: boolean;
  onClose: () => void;
  agenda: AgendaType;
  day: number;
  task: AgendaTask;
}) {
  const editTask = useAgendaStore((s) => s.editTask);
  const [text, setText] = useState(task.text);
  const [time, setTime] = useState(task.time ?? "none");

  const submit = () => {
    if (!text.trim()) return;
    editTask(agenda, day, task.id, text, time === "none" ? undefined : time);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Modifier la tâche</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Tâche</Label>
            <Input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </div>
          <div className="space-y-2">
            <Label>Heure</Label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="none">— Sans heure —</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={submit} disabled={!text.trim()}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Item ────────────────────────────────────────────────────────────────
function TaskItem({ task, agenda, day }: { task: AgendaTask; agenda: AgendaType; day: number }) {
  const { toggleTask, deleteTask } = useAgendaStore();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className={cn("group flex items-start gap-2 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors", task.done && "opacity-60")}>
        <button
          onClick={() => toggleTask(agenda, day, task.id)}
          className={cn(
            "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
            task.done ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"
          )}
        >
          {task.done && <Check className="w-2.5 h-2.5" />}
        </button>
        <div className="flex-1 min-w-0">
          {task.time && (
            <span className="text-[10px] text-primary font-semibold font-mono block leading-none mb-0.5">
              {task.time}
            </span>
          )}
          <span className={cn("text-xs leading-snug break-words", task.done && "line-through text-muted-foreground")}>
            {task.text}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditOpen(true)} className="p-1 text-muted-foreground hover:text-foreground rounded">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={() => deleteTask(agenda, day, task.id)} className="p-1 text-muted-foreground hover:text-destructive rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <EditTaskDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        agenda={agenda}
        day={day}
        task={task}
      />
    </>
  );
}

// ─── Day Column ───────────────────────────────────────────────────────────────
function DayColumn({ agenda, dayIndex, dayLabel }: { agenda: AgendaType; dayIndex: number; dayLabel: string }) {
  const tasks = useAgendaStore((s) => s.tasks[agenda][dayIndex]);
  const [addOpen, setAddOpen] = useState(false);

  const sorted = [...tasks].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const done = tasks.filter((t) => t.done).length;

  return (
    <>
      <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-[160px]">
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between gap-1">
          <div>
            <p className="text-sm font-semibold">{dayLabel}</p>
            {tasks.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{done}/{tasks.length}</p>
            )}
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tasks */}
        <div className="flex-1 py-1">
          {sorted.length === 0 ? (
            <button
              onClick={() => setAddOpen(true)}
              className="w-full h-full min-h-[60px] flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          ) : (
            sorted.map((task) => (
              <TaskItem key={task.id} task={task} agenda={agenda} day={dayIndex} />
            ))
          )}
        </div>

        {tasks.length > 0 && (
          <button
            onClick={() => setAddOpen(true)}
            className="py-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors border-t border-border/50 flex items-center justify-center gap-1"
          >
            <Plus className="w-2.5 h-2.5" />
            Ajouter
          </button>
        )}
      </div>

      <AddTaskDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        agenda={agenda}
        day={dayIndex}
        dayLabel={dayLabel}
      />
    </>
  );
}

// ─── Weekly Grid ──────────────────────────────────────────────────────────────
function WeeklyGrid({ agenda }: { agenda: AgendaType }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${AGENDA_DAYS.length}, minmax(145px, 1fr))`, minWidth: "1020px" }}>
        {AGENDA_DAYS.map((day, i) => (
          <DayColumn key={day} agenda={agenda} dayIndex={i} dayLabel={day} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const AGENDAS = [
  { id: "ecole" as AgendaType, label: "Semaine École", icon: GraduationCap, color: "text-blue-500" },
  { id: "travail" as AgendaType, label: "Semaine Travail", icon: Briefcase, color: "text-amber-500" },
];

export default function AgendaPage() {
  const [active, setActive] = useState<AgendaType>("ecole");
  const current = AGENDAS.find((a) => a.id === active)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          Agenda
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Planifiez votre semaine, type par type.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {AGENDAS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => setActive(a.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border",
                active === a.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn("w-4 h-4", active !== a.id && a.color)} />
              {a.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <WeeklyGrid agenda={active} />
    </div>
  );
}
