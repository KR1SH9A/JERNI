'use client';

import { useState, useTransition } from 'react';

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
  /** Whether the checklist should be read-only (e.g. for archived journeys) */
  isReadOnly?: boolean;
}

function todayUtc(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * TaskChecklist — client component rendering task checkboxes.
 *
 * MILESTONE tasks: checked if any active completion exists (forDate = null).
 * RECURRING tasks: checked if an active completion exists with forDate = today.
 *
 * Calls the Next.js route handler on toggle — JWT never touches this component.
 * Optimistic: checkbox state updates immediately, reverts on error.
 */
export function TaskChecklist({ journeyId, tasks, initialCompletions, isReadOnly }: TaskChecklistProps) {
  const today = todayUtc();

  // Build initial checked state from server-fetched completions
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

  const toggle = (task: TaskReadModel) => {
    if (isReadOnly || pending[task.id]) return;

    const nextChecked = !checked[task.id];
    setErrors((prev) => ({ ...prev, [task.id]: '' }));

    startTransition(async () => {
      // Optimistic update
      setChecked((prev) => ({ ...prev, [task.id]: nextChecked }));
      setPending((prev) => ({ ...prev, [task.id]: true }));

      try {
        const res = await fetch(
          `/api/journeys/${journeyId}/tasks/${task.id}/complete`,
          { method: nextChecked ? 'POST' : 'DELETE' },
        );

        if (!res.ok && res.status !== 204) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Failed to update task');
        }
      } catch (err) {
        // Roll back
        setChecked((prev) => ({ ...prev, [task.id]: !nextChecked }));
        setErrors((prev) => ({
          ...prev,
          [task.id]: err instanceof Error ? err.message : 'Error',
        }));
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
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--color-surface, rgba(255,255,255,0.04))',
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          opacity: isPending ? 0.7 : 1,
          transition: 'opacity 0.15s ease',
        }}
      >
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={isChecked}
          disabled={isPending || isReadOnly}
          onChange={() => toggle(task)}
          aria-label={`Mark "${task.title}" as ${isChecked ? 'incomplete' : 'complete'}`}
          style={{ marginTop: '2px', accentColor: 'var(--color-primary, #6366f1)', cursor: isReadOnly ? 'default' : 'pointer' }}
        />
        <div style={{ flex: 1 }}>
          <label
            htmlFor={`task-${task.id}`}
            style={{
              cursor: isReadOnly ? 'default' : 'pointer',
              textDecoration: isChecked ? 'line-through' : 'none',
              color: isChecked ? 'var(--color-muted, #888)' : 'inherit',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {task.title}
          </label>
          {isRecurring && (
            <p style={{ fontSize: '12px', color: 'var(--color-muted, #888)', margin: '2px 0 0' }}>
              Daily · Today: {today}
            </p>
          )}
          {error && (
            <p role="alert" style={{ fontSize: '12px', color: '#ef4444', margin: '2px 0 0' }}>
              {error}
            </p>
          )}
        </div>
        <span
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: isRecurring ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
            color: isRecurring ? '#818cf8' : '#34d399',
          }}
        >
          {isRecurring ? 'daily' : 'milestone'}
        </span>
      </li>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {milestones.length > 0 && (
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            Milestones
          </h3>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {milestones.map(renderTask)}
          </ol>
        </section>
      )}
      {recurring.length > 0 && (
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            Daily Recurring
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recurring.map(renderTask)}
          </ul>
        </section>
      )}
    </div>
  );
}
