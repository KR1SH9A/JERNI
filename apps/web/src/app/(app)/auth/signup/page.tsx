'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { OnboardingModal } from '@/components/onboarding-modal';
import { Toast, ToastType } from '@/components/ui/toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);

    if (password !== confirm) {
      setToast({ message: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters.', type: 'error' });
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'https://jerni.purpl.online',
      }
    });
    setLoading(false);

    if (authError) {
      setToast({ message: authError.message, type: 'error' });
      return;
    }

    if (data?.session === null) {
      // Email confirmation is required by Supabase
      setToast({ message: 'Successfully sent mail, check your inbox.', type: 'success' });
    } else {
      // Auto logged in (email confirmation disabled)
      setShowOnboarding(true);
    }
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
          background: 'var(--color-bg)', // match platform dark theme
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
              Start your journey
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Create a free account to join and track journeys
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              id="signup-email"
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
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
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

            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
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
              id="signup-submit"
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
              {loading ? 'Creating account…' : 'Sign up free'}
            </button>
          </form>


          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '1rem', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--color-text)', fontWeight: 700, textDecoration: 'underline' }}>
              Log in
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
