import type { Metadata } from 'next';
import { Fraunces, Figtree } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  weight: 'variable',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  weight: 'variable',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'JERNI',
    template: '%s — JERNI',
  },
  description:
    'Discover and follow curated learning journeys. ' +
    'Track your progress, compete with others, and level up together.',
  openGraph: {
    siteName: 'JERNI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
              document.documentElement.setAttribute('data-theme', 'light');
            } else {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          } catch (_) {}
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
