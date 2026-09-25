'use client';

import { useCompletions } from '@/lib/queries/use-completions';
import { Repeat, CheckCircle } from 'lucide-react';

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
 *
 * State is owned by the TanStack Query cache (via useCompletions).
 * Optimistic per-task toggles with rollback on error + toast notification.
 * No router.refresh() needed.
 */
export function TaskChecklist({ journeyId, tasks, initialCompletions, isReadOnly }: TaskChecklistProps) {
  const today = todayUtc();
  const { checked, isPending, toggle } = useCompletions(journeyId, initialCompletions);

  const sorted = [...tasks].sort((a, b) => a.orderIndex - b.orderIndex);
  const milestones = sorted.filter((t) => t.kind === 'MILESTONE');
  const recurring = sorted.filter((t) => t.kind === 'RECURRING');

  const renderTask = (task: TaskReadModel) => {
    const isChecked = checked[task.id] ?? false;
    const isTaskPending = isPending(task.id);
    const isRecurring = task.kind === 'RECURRING';

    return (
      <li
        key={task.id}
        className={`task-item${isChecked ? ' completed' : ''}`}
        style={{ opacity: isTaskPending ? 0.65 : 1 }}
      >
        {/* Custom checkbox */}
        <button
          type="button"
          id={`task-checkbox-${task.id}`}
          className={`task-checkbox${isChecked ? ' checked' : ''}`}
          disabled={isTaskPending || isReadOnly}
          onClick={() => toggle(task.id, isChecked)}
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
            <span className={`task-kind-pill ${isRecurring ? 'recurring' : 'milestone'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              {isRecurring ? <><Repeat size={12} /> Daily</> : <><CheckCircle size={12} /> Milestone</>}
            </span>
            {isRecurring && (
              <span style={{ color: 'var(--color-muted-2)', fontSize: '0.72rem' }}>
                {today}
              </span>
            )}
          </div>
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
