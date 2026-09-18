import { Nav } from '@/components/nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <div id="page-content" style={{ marginTop: 'var(--nav-height)' }}>
        {children}
      </div>
    </>
  );
}
