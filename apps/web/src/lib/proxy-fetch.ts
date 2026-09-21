/**
 * proxyFetch — thin wrapper around the NestJS API call used by all route handlers.
 *
 * Handles two consistent behaviours that every handler needs:
 *  1. Server-side console.error on non-2xx so NestJS errors are never silent in
 *     the Next.js process logs (fixes Issue #4 from the flow audit).
 *  2. Returns the raw Response so callers can read the body / status themselves.
 */
export async function proxyFetch(
  url: string,
  options: RequestInit,
  label: string,
): Promise<Response> {
  const res = await fetch(url, options);

  if (!res.ok) {
    // Clone before reading body so the caller can still read it too
    const clone = res.clone();
    const body = await clone.text().catch(() => '(unreadable body)');
    console.error(
      `[proxy] ${label} → NestJS returned ${res.status}: ${body.slice(0, 200)}`,
    );
  }

  return res;
}
