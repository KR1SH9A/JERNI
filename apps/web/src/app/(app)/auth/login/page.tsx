'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { OnboardingModal } from '@/components/onboarding-modal';
import { Toast, ToastType } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      if (authError.message === 'Email not confirmed') {
        setLoading(true);
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'https://jerni.purpl.online',
          }
        });
        setLoading(false);
        if (resendError) {
          setToast({ message: resendError.message, type: 'error' });
        } else {
          setToast({ message: 'Successfully sent mail, check your inbox.', type: 'success' });
        }
      } else if (authError.message === 'Invalid login credentials') {
        setToast({ message: "Can't find this mail or wrong password. Try a different one.", type: 'error' });
      } else {
        setToast({ message: authError.message, type: 'error' });
      }
      return;
    }

    if (data.user) {
      const created = new Date(data.user.created_at).getTime();
      const now = new Date().getTime();
      if (now - created < 1000 * 60 * 10) {
        setShowOnboarding(true);
        return;
      }
    }

    router.push('/dashboard');
  }

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'var(--color-bg)',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Logo */}
          <Link href="/" style={{ marginBottom: '2rem' }}>
            <Image
              src="/new-logo.svg"
              alt="JERNI logo"
              width={72}
              height={46}
              priority
              style={{ height: '4.5rem', width: 'auto', display: 'block' }}
            />
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '0.35rem',
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '999px',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '999px',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                marginTop: '1rem',
                alignSelf: 'center',
                padding: '1rem 4rem',
                borderRadius: '999px',
                background: 'var(--color-accent)',
                color: 'var(--color-bg)',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s, transform 0.1s',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>



          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '1rem', color: 'var(--color-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--color-text)', fontWeight: 700, textDecoration: 'underline' }}>
              Sign up free
            </Link>
          </p>
        </div>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </main>

      {showOnboarding && <OnboardingModal />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
