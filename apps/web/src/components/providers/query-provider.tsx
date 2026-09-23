'use client';

/**
 * QueryProvider — wraps the app in TanStack Query's QueryClientProvider.
 *
 * Design choices:
 * - staleTime: 60s — data is considered fresh for 60 seconds; prevents
 *   waterfall re-fetches on fast navigation (Discover → Journey → back).
 * - retry: 2 — network blips get 2 retries before reporting an error.
 * - refetchOnWindowFocus: false — socket events handle live updates;
 *   polling on tab focus would cause jarring re-renders.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One QueryClient per component tree, stable across re-renders.
  // Instantiating inside useState ensures Next.js server-side renders don't
  // share a QueryClient instance across requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 60 seconds
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
