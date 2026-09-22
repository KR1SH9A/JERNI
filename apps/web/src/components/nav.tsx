import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Nav — Server Component (glassmorphism top bar).
 * Reads session server-side so the JWT never reaches client JS.
 */
export async function Nav() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="global-nav">
      <div className="container nav-inner">
        {/* Wordmark */}
        <Link href="/" className="nav-logo" id="nav-logo">
          <Image
            src="/new-logo.svg"
            alt="JERNI logo"
            width={72}
            height={46}
            priority
            style={{ height: '1.25rem', width: 'auto', display: 'block' }}
          />
        </Link>

        {/* Links */}
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/discover" id="nav-discover" className="nav-link">
            Discover
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" id="nav-dashboard" className="nav-link">
                Dashboard
              </Link>
              <form action="/auth/signout" method="post" style={{ display: 'contents' }}>
                <button
                  type="submit"
                  className="nav-link-btn"
                  id="nav-signout"
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" id="nav-login" className="nav-link">
                Sign in
              </Link>
              <Link href="/auth/signup" id="nav-signup">
                <button className="btn-primary btn-sm" id="nav-signup-btn">
                  Get started
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
