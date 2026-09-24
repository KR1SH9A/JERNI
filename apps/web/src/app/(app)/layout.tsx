import { Nav } from '@/components/nav';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from 'sonner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <Nav />
      <div id="page-content" style={{ marginTop: 'var(--nav-height)' }}>
        {children}
      </div>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        }}
      />
    </QueryProvider>
  );
}
