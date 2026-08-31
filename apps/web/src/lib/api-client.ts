/**
 * apiClient — typed fetch wrapper for calling the NestJS API.
 *
 * From Server Components: uses API_INTERNAL_URL (never reaches browser).
 * From Client Components: should proxy through Next.js route handlers — this
 * client is only used server-side in Phase 1.
 */

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

interface ApiOptions extends RequestInit {
  token?: string; // Supabase JWT — injected from server-side session
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),
  patch: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),
};
