'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or an error reporting service
    console.error(error);
  }, [error]);

  return (
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
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <Image
          src="/new-logo.svg"
          alt="JERNI logo"
          width={72}
          height={46}
          priority
          style={{ height: '4.5rem', width: 'auto', display: 'block', marginBottom: '2rem', opacity: 0.9 }}
        />
        
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '0.75rem',
          lineHeight: 1.2,
        }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-muted)', marginBottom: '2.5rem', lineHeight: 1.5 }}>
          We hit a bump in the road. Don't worry, even the best journeys have unexpected detours.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '1rem 2rem',
              borderRadius: '999px',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Try again
          </button>
          <Link href="/" style={{
            padding: '1rem 2rem',
            borderRadius: '999px',
            background: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Go Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
