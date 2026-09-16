import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

/**
 * Nav — Server Component.
 * Reads session server-side so we never expose the JWT to the client.
 * Shows Dashboard link if logged in; login link otherwise.
 */
export async function Nav() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <header className="global-nav">
      <div className="container nav-inner">
        <Link href="/" className="nav-logo" id="nav-logo">
          <span className="logo-icon">🗺</span>
          <span className="logo-text">JERNI</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/" id="nav-discover" className="nav-link">
            Discover
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" id="nav-dashboard" className="nav-link">
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="nav-link nav-link-btn" id="nav-signout">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/login" id="nav-login">
              <button className="btn-primary btn-sm" id="nav-login-btn">Sign in</button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
