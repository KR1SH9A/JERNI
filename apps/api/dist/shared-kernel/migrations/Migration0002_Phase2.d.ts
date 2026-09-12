import { Migration } from '@mikro-orm/migrations';
/**
 * Migration 0002 — Phase 2: Participation, Execution & Engagement tables.
 *
 * Tables created:
 *  - memberships       (Participation context)
 *  - likes             (Engagement context)
 *  - task_completions  (Execution context)
 *
 * Key constraints explained:
 *
 * memberships:
 *   A unique PARTIAL index (WHERE status = 'ACTIVE') enforces the invariant
 *   that a user can only have ONE active membership per journey. This survives
 *   race conditions that application-layer checks miss (two concurrent join requests).
 *
 * task_completions:
 *   UNIQUE NULLS NOT DISTINCT on (journey_id, user_id, task_definition_id, for_date)
 *   encodes both completion types in a single constraint:
 *     - MILESTONE: for_date = NULL → unique once per task, forever
 *     - RECURRING: for_date = 'YYYY-MM-DD' → unique per task per calendar day
 *   Requires Postgres 15+. Supabase has been on Postgres 15 since early 2024.
 */
export declare class Migration0002_Phase2 extends Migration {
    up(): Promise<void>;
    down(): Promise<void>;
}
//# sourceMappingURL=Migration0002_Phase2.d.ts.map