'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

/**
 * /auth/signup — Sign-up page.
 * Creates a new Supabase user with email + password.
 * On success redirects to dashboard (Supabase sends a confirmation email if
 * email confirm is enabled in the project settings).
 */
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
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

    // Supabase may require email confirmation — show a success message.
    setSuccess(true);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text)',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '2rem' }}>🗺</span>
            <span
              className="logo-text"
              style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}
            >
              JERNI
            </span>
          </Link>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Create your account
          </p>
        </div>

        {success ? (
          <div
            id="signup-success"
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(34,197,94,0.08)',
              borderRadius: '10px',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            <p style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🎉</p>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Account created!</p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              Check your email for a confirmation link, then{' '}
              <Link href="/auth/login" style={{ color: 'var(--color-accent)' }}>
                sign in
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                htmlFor="signup-email"
                style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-muted)' }}
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-muted)' }}
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="signup-confirm"
                style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-muted)' }}
              >
                Confirm password
              </label>
              <input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error && (
              <p
                id="signup-error"
                style={{
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  padding: '0.6rem 0.85rem',
                  background: 'rgba(239,68,68,0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,0.2)',
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.5rem', width: '100%', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--color-accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
