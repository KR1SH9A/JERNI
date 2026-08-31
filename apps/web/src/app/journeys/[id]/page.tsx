import { apiClient } from '@/lib/api-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface TaskReadModel {
  id: string;
  title: string;
  orderIndex: number;
  kind: 'MILESTONE' | 'RECURRING';
  recurrenceRule: string | null;
}

interface JourneyDetail {
  id: string;
  curatorId: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  visibility: string;
  likeCount: number;
  taskCount: number;
  createdAt: string;
  tasks: TaskReadModel[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const journey = await apiClient.get<JourneyDetail>(`/journeys/${id}`);
    return {
      title: `${journey.title} — JERNI`,
      description: journey.description || `A journey with ${journey.taskCount} tasks.`,
    };
  } catch {
    return { title: 'Journey — JERNI' };
  }
}

/**
 * Journey Detail page — Server Component.
 * Read-only in Phase 1 (join button, checkboxes come in Phase 2).
 */
export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let journey: JourneyDetail;
  try {
    journey = await apiClient.get<JourneyDetail>(`/journeys/${id}`);
  } catch {
    notFound();
  }

  const milestoneTasks = journey.tasks.filter((t) => t.kind === 'MILESTONE');
  const recurringTasks = journey.tasks.filter((t) => t.kind === 'RECURRING');

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Link href="/" style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
        ← Back to Discover
      </Link>

      {/* Header */}
      <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        {/* Placeholder cover */}
        <div
          style={{
            height: 200,
            borderRadius: 'var(--radius)',
            background: `hsl(${journey.title.charCodeAt(0) * 5}, 40%, 18%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.12)',
            marginBottom: '1.5rem',
          }}
        >
          {journey.title.slice(0, 2).toUpperCase()}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {journey.title}
            </h1>
            {journey.description && (
              <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>
                {journey.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {journey.tags.map((tag) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 150 }}>
            <span className={`badge ${journey.status.toLowerCase()}`} style={{ textAlign: 'center' }}>
              {journey.status}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'center' }}>
              ❤️ {journey.likeCount} likes · 📋 {journey.taskCount} tasks
            </span>
            {/* Join button placeholder — wired in Phase 2 */}
            <button className="primary" disabled style={{ opacity: 0.5 }}>
              Join (Phase 2)
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Tasks
        </h2>

        {journey.tasks.length === 0 && (
          <p style={{ color: 'var(--color-muted)' }}>No tasks yet.</p>
        )}

        {milestoneTasks.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Milestones
            </h3>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {milestoneTasks
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((task, i) => (
                  <li key={task.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--color-muted)', fontVariantNumeric: 'tabular-nums', minWidth: '1.5rem' }}>
                      {i + 1}.
                    </span>
                    <span style={{ flex: 1 }}>{task.title}</span>
                    <span className="badge milestone">milestone</span>
                  </li>
                ))}
            </ol>
          </div>
        )}

        {recurringTasks.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Daily Recurring
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recurringTasks.map((task) => (
                <li key={task.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>🔁</span>
                  <span style={{ flex: 1 }}>{task.title}</span>
                  <span className="badge recurring">{task.recurrenceRule?.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
