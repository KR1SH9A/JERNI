'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queries/query-keys';
interface TaskReadModel {
  id: string;
  title: string;
  orderIndex: number;
  kind: 'MILESTONE' | 'RECURRING';
  recurrenceRule: string | null;
}
interface AddTaskFormProps {
  journeyId: string;
  onTaskAdded?: (task: TaskReadModel) => void;
}
export function AddTaskForm({ journeyId, onTaskAdded }: AddTaskFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'MILESTONE' | 'RECURRING'>('MILESTONE');
  const [isExpanded, setIsExpanded] = useState(false);
  const mutation = useMutation({
    mutationFn: async (payload: { title: string; kind: string; recurrenceRule?: string }) => {
      const res = await fetch(`/api/journeys/${journeyId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Your session has expired. Please sign in again to add tasks.');
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Failed to add task');
      }
      return res.json() as Promise<TaskReadModel>;
    },
    onSuccess: (newTask) => {
      // Reset form
      setTitle('');
      setKind('MILESTONE');
      toast.success('Task added!');
      // Notify parent (TaskManager) to update its task list in cache
      onTaskAdded?.(newTask);
      // Invalidate journey so taskCount stays accurate
      queryClient.invalidateQueries({ queryKey: queryKeys.journey(journeyId) });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    },
  });
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || mutation.isPending) return;
    const payload: { title: string; kind: string; recurrenceRule?: string } = {
      title: title.trim(),
      kind,
    };
    if (kind === 'RECURRING') payload.recurrenceRule = 'DAILY';
    mutation.mutate(payload);
  }
  return (
    <>
      <style>{`
        .add-task-container {
          margin-top: 1.5rem;
          perspective: 1000px;
        }
        .add-task-trigger {
          width: 100%;
          padding: 1rem;
          border: 1px dashed var(--color-border);
          border-radius: var(--radius);
          background: transparent;
          color: var(--color-muted);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .add-task-trigger:hover {
          background: var(--color-surface);
          color: var(--color-text);
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .add-task-form-wrapper {
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 0;
          opacity: 0;
          transform: translateY(-10px);
        }
        .add-task-form-wrapper.open {
          max-height: 200px;
          opacity: 1;
          transform: translateY(0);
        }
        .add-task-form {
          padding: 1.5rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          background: var(--color-surface);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .add-task-inputs {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .add-task-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        .add-task-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s, background 0.2s, color 0.2s;
          border: none;
        }
        .add-task-btn:active {
          transform: scale(0.96);
        }
        .add-task-btn.primary {
          background: var(--color-accent);
          color: var(--color-bg);
        }
        .add-task-btn.primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .add-task-btn.cancel {
          background: transparent;
          color: var(--color-muted);
        }
        .add-task-btn.cancel:hover {
          color: var(--color-text);
          background: var(--color-border);
        }
      `}</style>
      <div className="add-task-container">
        {!isExpanded ? (
          <button 
            type="button" 
            className="add-task-trigger"
            onClick={() => setIsExpanded(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add a new task
          </button>
        ) : (
          <div className="add-task-form-wrapper open">
            <form onSubmit={handleSubmit} className="add-task-form">
              <div className="add-task-inputs">
                <input
                  type="text"
                  required
                  autoFocus
                  minLength={3}
                  maxLength={200}
                  placeholder="e.g. Read Chapter 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={mutation.isPending}
                  className="form-input"
                />
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as 'MILESTONE' | 'RECURRING')}
                  disabled={mutation.isPending}
                  className="form-select"
                >
                  <option value="MILESTONE">Milestone</option>
                  <option value="RECURRING">Recurring</option>
                </select>
              </div>
              <div className="add-task-actions">
                <button
                  type="button"
                  className="add-task-btn cancel"
                  onClick={() => setIsExpanded(false)}
                  disabled={mutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="add-task-btn primary"
                  disabled={mutation.isPending || !title.trim()}
                >
                  {mutation.isPending ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
