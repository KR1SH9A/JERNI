import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';

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
        <Nav />
        <div id="page-content">
          {children}
        </div>
      </body>
    </html>
  );
}
