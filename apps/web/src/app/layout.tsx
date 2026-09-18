import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'JERNI — Curated Learning Journeys',
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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
