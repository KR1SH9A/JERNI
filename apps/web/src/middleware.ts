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

  // getUser() hits the Supabase auth server and may rotate the token.
  // We call getSession() AFTER it so x-user-token always carries the
  // freshest access token, not the one that was in the cookie at request start.
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
      supabaseResponse.cookies.set(cookie.name, cookie.value, cookie as any);
    });

    const url = request.nextUrl;
    if (url.pathname.startsWith('/auth/login') || url.pathname.startsWith('/auth/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
