'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface TaskReadModel {
  id: string;
  title: string;
  orderIndex: number;
  kind: 'MILESTONE' | 'RECURRING';
  recurrenceRule: string | null;
}

interface CompletionReadModel {
  taskDefinitionId: string;
  taskKindSnapshot: string;
  forDate: string | null;
  isActive: boolean;
}

interface TaskChecklistProps {
  journeyId: string;
  tasks: TaskReadModel[];
  /** Server-fetched completions — seeds initial checkbox state */
  initialCompletions: CompletionReadModel[];
  /** Whether the checklist should be read-only */
  isReadOnly?: boolean;
}

function todayUtc(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * TaskChecklist — styled task checkboxes with MILESTONE/RECURRING visual distinction.
 * Custom checkbox design; optimistic updates with rollback on error.
 */
export function TaskChecklist({ journeyId, tasks, initialCompletions, isReadOnly }: TaskChecklistProps) {
  const today = todayUtc();

  const initialChecked: Record<string, boolean> = {};
  for (const c of initialCompletions) {
    if (!c.isActive) continue;
    if (c.taskKindSnapshot === 'MILESTONE') {
      initialChecked[c.taskDefinitionId] = true;
    } else if (c.taskKindSnapshot === 'RECURRING' && c.forDate === today) {
      initialChecked[c.taskDefinitionId] = true;
    }
  }

  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();
  const router = useRouter();

  const toggle = (task: TaskReadModel) => {
    if (isReadOnly || pending[task.id]) return;
    const nextChecked = !checked[task.id];
    setErrors((prev) => ({ ...prev, [task.id]: '' }));

    setChecked((prev) => ({ ...prev, [task.id]: nextChecked }));
    setPending((prev) => ({ ...prev, [task.id]: true }));

    startTransition(async () => {

      try {
        const res = await fetch(
          `/api/journeys/${journeyId}/tasks/${task.id}/complete`,
          { method: nextChecked ? 'POST' : 'DELETE' },
        );
        if (!res.ok && res.status !== 204) {
          if (res.status === 401) throw new Error('SESSION_EXPIRED');
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Failed to update task');
        }
        
        router.refresh();
      } catch (err) {
        setChecked((prev) => ({ ...prev, [task.id]: !nextChecked }));
        const msg = err instanceof Error
          ? err.message === 'SESSION_EXPIRED' ? 'Session expired — sign in again' : err.message
          : 'Error';
        setErrors((prev) => ({ ...prev, [task.id]: msg }));
      } finally {
        setPending((prev) => ({ ...prev, [task.id]: false }));
      }
    });
  };

  const sorted = [...tasks].sort((a, b) => a.orderIndex - b.orderIndex);
  const milestones = sorted.filter((t) => t.kind === 'MILESTONE');
  const recurring = sorted.filter((t) => t.kind === 'RECURRING');

  const renderTask = (task: TaskReadModel) => {
    const isChecked = checked[task.id] ?? false;
    const isPending = pending[task.id] ?? false;
    const error = errors[task.id];
    const isRecurring = task.kind === 'RECURRING';

    return (
      <li
        key={task.id}
        className={`task-item${isChecked ? ' completed' : ''}`}
        style={{ opacity: isPending ? 0.65 : 1 }}
      >
        {/* Custom checkbox */}
        <button
          type="button"
          id={`task-checkbox-${task.id}`}
          className={`task-checkbox${isChecked ? ' checked' : ''}`}
          disabled={isPending || isReadOnly}
          onClick={() => toggle(task)}
          aria-pressed={isChecked}
          aria-label={`Mark "${task.title}" as ${isChecked ? 'incomplete' : 'complete'}`}
        />

        <div className="task-body">
          <label
            htmlFor={`task-checkbox-${task.id}`}
            className="task-title"
            style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
          >
            {task.title}
          </label>

          <div className="task-meta">
            <span className={`task-kind-pill ${isRecurring ? 'recurring' : 'milestone'}`}>
              {isRecurring ? '↻ Daily' : '◆ Milestone'}
            </span>
            {isRecurring && (
              <span style={{ color: 'var(--color-muted-2)', fontSize: '0.72rem' }}>
                {today}
              </span>
            )}
          </div>

          {error && (
            <p role="alert" style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.15rem' }}>
              {error}
            </p>
          )}
        </div>
      </li>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--color-muted-2)', fontSize: '0.875rem' }}>No tasks added yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {milestones.length > 0 && (
        <section>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted-2)', marginBottom: '0.75rem' }}>
            Milestones — {milestones.filter(t => checked[t.id]).length}/{milestones.length} done
          </p>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {milestones.map(renderTask)}
          </ol>
        </section>
      )}
      {recurring.length > 0 && (
        <section>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted-2)', marginBottom: '0.75rem' }}>
            Daily Recurring — {recurring.filter(t => checked[t.id]).length}/{recurring.length} done today
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recurring.map(renderTask)}
          </ul>
        </section>
      )}
    </div>
  );
}
