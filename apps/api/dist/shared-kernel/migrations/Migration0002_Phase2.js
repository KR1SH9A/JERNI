"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration0002_Phase2 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
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
class Migration0002_Phase2 extends migrations_1.Migration {
    async up() {
        // ── memberships ──────────────────────────────────────────────────────────
        await this.execute(`
      CREATE TABLE IF NOT EXISTS memberships (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        journey_id  UUID        NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
        user_id     TEXT        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        status      TEXT        NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'LEFT'))
      );

      CREATE INDEX idx_memberships_journey_id ON memberships (journey_id);
      CREATE INDEX idx_memberships_user_id ON memberships (user_id);

      -- THE key invariant: only one ACTIVE membership per (journey, user).
      -- A partial unique index so LEFT memberships (history) don't block re-joins.
      CREATE UNIQUE INDEX uidx_memberships_active
        ON memberships (journey_id, user_id)
        WHERE status = 'ACTIVE';
    `);
        // ── likes ────────────────────────────────────────────────────────────────
        await this.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        journey_id  UUID        NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
        user_id     TEXT        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        liked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

        -- One like per user per journey. No dislike column by design.
        UNIQUE (journey_id, user_id)
      );

      CREATE INDEX idx_likes_journey_id ON likes (journey_id);
    `);
        // ── task_completions ─────────────────────────────────────────────────────
        await this.execute(`
      CREATE TABLE IF NOT EXISTS task_completions (
        id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        journey_id           UUID        NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
        user_id              TEXT        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        task_definition_id   UUID        NOT NULL REFERENCES task_definitions(id) ON DELETE CASCADE,
        task_kind_snapshot   TEXT        NOT NULL
                               CHECK (task_kind_snapshot IN ('MILESTONE', 'RECURRING')),
        for_date             DATE        NULL,
        completed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        revoked_at           TIMESTAMPTZ NULL,

        -- The milestone/recurring uniqueness trick (Postgres 15+ required):
        --   NULL = NULL in this constraint, so:
        --     MILESTONE (for_date = NULL): unique once per (journey, user, task)
        --     RECURRING (for_date = date): unique per (journey, user, task, day)
        CONSTRAINT uq_task_completion
          UNIQUE NULLS NOT DISTINCT (journey_id, user_id, task_definition_id, for_date)
      );

      CREATE INDEX idx_task_completions_journey_user
        ON task_completions (journey_id, user_id);
    `);
    }
    async down() {
        await this.execute(`
      DROP TABLE IF EXISTS task_completions;
      DROP TABLE IF EXISTS likes;
      DROP TABLE IF EXISTS memberships;
    `);
    }
}
exports.Migration0002_Phase2 = Migration0002_Phase2;
//# sourceMappingURL=Migration0002_Phase2.js.map