import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found - JERNI',
};

export default function NotFound() {
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
          fontSize: '3rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '0.5rem',
        }}>
          404
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-muted)', marginBottom: '2.5rem', lineHeight: 1.5 }}>
          It looks like this path leads nowhere. Let's get you back on your journey.
        </p>

        <Link href="/" style={{
          padding: '1rem 2.5rem',
          borderRadius: '999px',
          background: 'var(--color-accent)',
          color: 'var(--color-bg)',
          fontWeight: 700,
          textDecoration: 'none',
          transition: 'transform 0.1s',
        }}>
          Return Home
        </Link>
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
