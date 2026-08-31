import { Migration } from '@mikro-orm/migrations';
/**
 * Migration 0001 — Phase 0 + Phase 1 foundation tables.
 *
 * Tables created:
 *  - user_profiles      (Identity context)
 *  - journeys           (Curation context)
 *  - task_definitions   (Curation context)
 *  - feature_flags      (Media context — controls media_uploads toggle)
 *
 * RLS is NOT configured here — Supabase RLS policies are managed via the
 * Supabase dashboard / SQL editor as they operate on the auth schema level.
 * The app DB role has INSERT/UPDATE/DELETE privileges; SELECT is also open
 * to the service role. Row-level safety is a defense-in-depth layer on top.
 */
export declare class Migration0001_Foundation extends Migration {
    up(): Promise<void>;
    down(): Promise<void>;
}
//# sourceMappingURL=Migration0001_Foundation.d.ts.map