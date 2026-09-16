/**
 * DailyStat — read model entity for the Stats bounded context.
 *
 * NOT an aggregate — it has no business invariants. It is a pure
 * projection, written to by event handlers and read by queries.
 *
 * Schema: one row per (journey, user, task, date).
 * completedCount is 0 or 1 for RECURRING tasks (reset each calendar day)
 * and 0 or 1 for MILESTONE tasks (set once, never reset).
 *
 * This table can be DROP-ped and rebuilt by replaying task_completions.
 */
export interface DailyStat {
  journeyId: string;
  userId: string;
  taskDefinitionId: string;
  /** ISO date string 'YYYY-MM-DD' (UTC) */
  forDate: string;
  completedCount: number; // always 0 or 1 in current model
}
