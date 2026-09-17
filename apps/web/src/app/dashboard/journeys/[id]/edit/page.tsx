import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import { JourneyForm } from '@/components/journey-form';

export const metadata: Metadata = {
  title: 'Edit Journey — JERNI',
};

interface JourneyDetail {
  id: string;
  curatorId: string;
  title: string;
  description: string;
  tags: string[];
  visibility: 'PUBLIC' | 'PRIVATE';
  status: string;
}

/**
 * Edit Journey page — Server Component.
 * Only accessible to the curator. Only works for DRAFT journeys.
 */
export default async function EditJourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ── Auth guard ──────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  // ── Load journey ─────────────────────────────────────────────────────────
  let journey: JourneyDetail;
  try {
    journey = await apiClient.get<JourneyDetail>(`/journeys/${id}`, {
      token: session.access_token,
    });
  } catch {
    notFound();
  }

  // Auth: only the curator can edit
  if (journey.curatorId !== session.user.id) redirect(`/journeys/${id}`);
  // Domain: only DRAFT journeys are editable
  if (journey.status !== 'DRAFT') redirect(`/journeys/${id}`);

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 640 }}>
      <a href="/dashboard" style={{ color: 'var(--color-muted)', fontSize: '0.875rem', display: 'block', marginBottom: '1.5rem' }}>
        ← Back to Dashboard
      </a>

      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Edit Journey</h1>

      <div className="card">
        <JourneyForm
          journeyId={journey.id}
          initialValues={{
            title: journey.title,
            description: journey.description,
            tags: journey.tags.join(', '),
            visibility: journey.visibility,
          }}
        />
      </div>
    </main>
  );
}
