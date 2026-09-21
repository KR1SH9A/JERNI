'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface AddTaskFormProps {
  journeyId: string;
}

export function AddTaskForm({ journeyId }: AddTaskFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'MILESTONE' | 'RECURRING'>('MILESTONE');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);

    const payload: any = {
      title: title.trim(),
      kind,
    };
    if (kind === 'RECURRING') {
      payload.recurrenceRule = 'DAILY';
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/journeys/${journeyId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('Your session has expired. Please sign in again to add tasks.');
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Failed to add task');
        }

        // Reset form on success
        setTitle('');
        setKind('MILESTONE');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="card animate-fade-in" 
      style={{ 
        marginTop: '1.5rem', 
        padding: '1.5rem', 
        border: '1px dashed var(--color-border)', 
        background: 'transparent' 
      }}
    >
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add a Task</h3>
      
      {error && (
        <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            placeholder="e.g. Read Chapter 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            style={{ 
              width: '100%', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '6px', 
              border: '1px solid var(--color-border)' 
            }}
          />
        </div>
        
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as 'MILESTONE' | 'RECURRING')}
          disabled={isPending}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '6px', 
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)'
          }}
        >
          <option value="MILESTONE">Milestone (Once)</option>
          <option value="RECURRING">Recurring (Daily)</option>
        </select>

        <button 
          type="submit" 
          disabled={isPending || !title.trim()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: 'var(--color-primary, #6366f1)',
            color: 'white',
            border: 'none',
            fontWeight: 500,
            cursor: (isPending || !title.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isPending || !title.trim()) ? 0.6 : 1
          }}
        >
          {isPending ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
