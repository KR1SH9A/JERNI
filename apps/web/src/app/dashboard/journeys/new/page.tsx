import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { JourneyForm } from '@/components/journey-form';

export const metadata: Metadata = {
  title: 'New Journey — JERNI',
  description: 'Create a new curated journey on JERNI.',
};

/**
 * New Journey page — Server Component.
 * Guards auth, then renders JourneyForm in create mode.
 */
export default async function NewJourneyPage() {
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 640 }}>
      <a href="/dashboard" style={{ color: 'var(--color-muted)', fontSize: '0.875rem', display: 'block', marginBottom: '1.5rem' }}>
        ← Back to Dashboard
      </a>

      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Create a Journey</h1>

      <div className="card">
        <JourneyForm />
      </div>
    </main>
  );
}
