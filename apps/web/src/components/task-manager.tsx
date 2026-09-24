'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TaskChecklist } from './task-checklist';
import { AddTaskForm } from './add-task-form';

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

interface TaskManagerProps {
  journeyId: string;
  initialTasks: TaskReadModel[];
  initialCompletions: CompletionReadModel[];
  token?: string;
  initialIsMember: boolean;
  status: string;
  isCurator: boolean;
}

import { useMembership } from '@/lib/queries/use-membership';

export function TaskManager({
  journeyId,
  initialTasks,
  initialCompletions,
  token,
  initialIsMember,
  status,
  isCurator,
}: TaskManagerProps) {
  const [tasks, setTasks] = useState<TaskReadModel[]>(initialTasks);
  const { isMember } = useMembership(journeyId, initialIsMember);

  const handleTaskAdded = (newTask: TaskReadModel) => {
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <>
      {tasks.length === 0 && (
        <p style={{ color: 'var(--color-muted)' }}>No tasks yet.</p>
      )}

      {tasks.length > 0 && (
        <>
          {token && isMember ? (
            <TaskChecklist
              journeyId={journeyId}
              tasks={tasks}
              initialCompletions={initialCompletions}
              isReadOnly={status !== 'PUBLISHED'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: token ? 1 : 0.8 }}>
              {[...tasks]
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>
                      {task.kind === 'RECURRING' ? 'O' : '◻'}
                    </span>
                    <span style={{ flex: 1, fontSize: '14px' }}>{task.title}</span>
                    <span className={`badge ${task.kind?.toLowerCase() ?? 'milestone'}`}>
                      {task.kind === 'RECURRING' ? 'RECURRING' : 'MILESTONE'}
                    </span>
                  </div>
                ))}
              {!token && status === 'PUBLISHED' && (
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '8px' }}>
                  <Link href="/auth/login">Sign in</Link> and join this journey to track your progress.
                </p>
              )}
              {token && !isMember && status === 'PUBLISHED' && (
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '8px' }}>
                  Join this journey to start tracking your progress.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Task Form — only for the curator on DRAFT or PUBLISHED journeys */}
      {isCurator && status !== 'ARCHIVED' && (
        <AddTaskForm journeyId={journeyId} onTaskAdded={handleTaskAdded} />
      )}
    </>
  );
}
