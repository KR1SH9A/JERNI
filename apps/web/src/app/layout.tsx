import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JERNI — Journey Together',
  description:
    'JERNI helps you discover and follow curated learning journeys. ' +
    'Track your progress, compete with others, and level up together.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
