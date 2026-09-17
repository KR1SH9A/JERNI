"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration0003_Stats = void 0;
const migrations_1 = require("@mikro-orm/migrations");
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
class Migration0003_Stats extends migrations_1.Migration {
    async up() {
        // ── daily_stats ──────────────────────────────────────────────────────────
        await this.execute(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        journey_id          UUID    NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
        user_id             TEXT    NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        task_definition_id  UUID    NOT NULL REFERENCES task_definitions(id) ON DELETE CASCADE,
        for_date            DATE    NOT NULL,
        completed_count     SMALLINT NOT NULL DEFAULT 0
                              CHECK (completed_count >= 0),

        PRIMARY KEY (journey_id, user_id, task_definition_id, for_date)
      );

      -- Index for "give me everything completed by anyone in journey X today"
      CREATE INDEX idx_daily_stats_journey_date
        ON daily_stats (journey_id, for_date);
    `);
        // ── all_time_stats ───────────────────────────────────────────────────────
        await this.execute(`
      CREATE TABLE IF NOT EXISTS all_time_stats (
        journey_id             UUID    NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
        user_id                TEXT    NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        display_name           TEXT    NOT NULL DEFAULT '',
        milestones_completed   INTEGER NOT NULL DEFAULT 0
                                 CHECK (milestones_completed >= 0),
        recurring_done_today   INTEGER NOT NULL DEFAULT 0
                                 CHECK (recurring_done_today >= 0),

        PRIMARY KEY (journey_id, user_id)
      );
    `);
    }
    async down() {
        await this.execute(`
      DROP TABLE IF EXISTS all_time_stats;
      DROP TABLE IF EXISTS daily_stats;
    `);
    }
}
exports.Migration0003_Stats = Migration0003_Stats;
//# sourceMappingURL=Migration0003_Stats.js.map