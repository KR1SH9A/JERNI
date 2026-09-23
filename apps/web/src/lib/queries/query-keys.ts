/**
 * queryKeys — structured, type-safe query key factory for TanStack Query.
 *
 * Using an object factory (instead of plain arrays) ensures:
 * 1. Consistent key shapes across all hooks → reliable cache invalidation.
 * 2. TypeScript autocomplete on all keys.
 * 3. Hierarchical invalidation: invalidating ['journey', id] busts ALL
 *    sub-queries (membership, like, completions, stats) in one call.
 */

export const queryKeys = {
  // ── Journey ──────────────────────────────────────────────────────────────
  journey: (id: string) => ['journey', id] as const,

  // ── Sub-queries (all nested under journey root for bulk invalidation) ────
  membership: (journeyId: string) => ['journey', journeyId, 'membership'] as const,
  like: (journeyId: string) => ['journey', journeyId, 'like'] as const,
  completions: (journeyId: string) => ['journey', journeyId, 'completions'] as const,
  stats: (journeyId: string) => ['journey', journeyId, 'stats'] as const,

  // ── List pages ───────────────────────────────────────────────────────────
  discover: () => ['discover'] as const,
  dashboard: () => ['dashboard'] as const,
} as const;
