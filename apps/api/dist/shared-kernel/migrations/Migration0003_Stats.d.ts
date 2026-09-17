import { Migration } from '@mikro-orm/migrations';
/**
 * Migration 0003 — Phase 3: Stats read-side tables.
 *
 * Tables created:
 *  - daily_stats    — one row per (journey, user, task, date), completedCount 0|1
 *  - all_time_stats — one row per (journey, user), cumulative milestone + today recurring count
 *
 * Design decisions:
 *  - Both tables' PKs ARE the unique keys — no separate index needed.
 *  - upsert handlers use `ON CONFLICT DO UPDATE` on the PK.
 *  - completedCount has a CHECK (>= 0) to guard against underflow from
 *    uncomplete events arriving out of order (e.g. after a replay).
 *  - `display_name` is denormalized into all_time_stats so the leaderboard
 *    query never needs to JOIN user_profiles at read time (hot path).
 *    It is updated whenever a user's first stat row is inserted. If a user
 *    changes their display name, run `UPDATE all_time_stats SET display_name = ...`
 *    as a background job (Phase 4 concern).
 *
 * These tables are pure CQRS read models — they can be dropped and rebuilt
 * by replaying all TaskCompleted/TaskUncompleted rows from task_completions.
 */
export declare class Migration0003_Stats extends Migration {
    up(): Promise<void>;
    down(): Promise<void>;
}
//# sourceMappingURL=Migration0003_Stats.d.ts.map