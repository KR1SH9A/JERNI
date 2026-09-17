import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware — refreshes the Supabase session on every request.
 *
 * Required by @supabase/ssr so the httpOnly cookie is kept fresh.
 * Does NOT redirect unauthenticated users — the API guard handles that.
 */
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Securely refresh session (extends cookie expiry) and get the latest session
  await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    // Forward the access token to downstream Route Handlers to avoid race conditions
    requestHeaders.set('x-user-token', session.access_token);
    
    // Recreate response with updated request headers so Route Handlers see them
    const existingCookies = supabaseResponse.cookies.getAll();
    supabaseResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });
    existingCookies.forEach((cookie) => {
      // Need to cast to any to pass the entire cookie options safely
      supabaseResponse.cookies.set(cookie.name, cookie.value, cookie as any);
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
