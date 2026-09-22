'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { OnboardingModal } from '@/components/onboarding-modal';

/**
 * /auth/signup — Sign-up page.
 * On success: shows the onboarding recommendation modal before sending to dashboard.
 */
export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Show the onboarding modal immediately after signup
    setShowOnboarding(true);
  }

  return (
    <>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(104,199,236,0.06) 0%, transparent 70%)',
        }}
      >
        <div className="auth-card animate-slide-up">
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              marginBottom: '2rem',
            }}
          >
            <span
              className="jerni-logo-mask"
              style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-accent)' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '0.12em',
                color: 'var(--color-text)',
                marginTop: '0.5rem',
              }}
            >
              JERNI
            </span>
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                fontWeight: 400,
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">Email</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">Password</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm" className="form-label">Confirm password</label>
              <input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            {error && (
              <span id="signup-error" className="form-error">{error}</span>
            )}

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.25rem', width: '100%' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '14px', height: '14px', border: '2px solid rgba(5,19,26,0.3)',
                    borderTopColor: '#05131a', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>

      {/* Onboarding modal — appears immediately after signup */}
      {showOnboarding && <OnboardingModal />}
    </>
  );
}
