"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration0001_Foundation = void 0;
const migrations_1 = require("@mikro-orm/migrations");
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
class Migration0001_Foundation extends migrations_1.Migration {
    async up() {
        // ── Extensions ─────────────────────────────────────────────────────────
        await this.execute(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
        // ── user_profiles ───────────────────────────────────────────────────────
        // id = Supabase auth.uid() — NOT a serial; this is always the auth UID.
        await this.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id            TEXT        PRIMARY KEY,
        display_name  TEXT        NOT NULL,
        avatar_provider  TEXT     NULL,
        avatar_asset_id  TEXT     NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
        // ── journeys ────────────────────────────────────────────────────────────
        await this.execute(`
      CREATE TABLE IF NOT EXISTS journeys (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        curator_id      TEXT        NOT NULL REFERENCES user_profiles(id),
        title           TEXT        NOT NULL,
        description     TEXT        NOT NULL DEFAULT '',
        tags            TEXT[]      NOT NULL DEFAULT '{}',
        visibility      TEXT        NOT NULL DEFAULT 'PUBLIC'
                          CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
        status          TEXT        NOT NULL DEFAULT 'DRAFT'
                          CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
        cover_provider  TEXT        NULL,
        cover_asset_id  TEXT        NULL,
        like_count      INTEGER     NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_journeys_curator_id ON journeys (curator_id);
      CREATE INDEX idx_journeys_status_visibility ON journeys (status, visibility);
    `);
        // ── task_definitions ────────────────────────────────────────────────────
        await this.execute(`
      CREATE TABLE IF NOT EXISTS task_definitions (
        id               UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
        journey_id       UUID   NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
        title            TEXT   NOT NULL,
        order_index      INTEGER NOT NULL,
        kind             TEXT   NOT NULL CHECK (kind IN ('MILESTONE', 'RECURRING')),
        recurrence_rule  TEXT   NULL CHECK (
          (kind = 'RECURRING' AND recurrence_rule IS NOT NULL) OR
          (kind = 'MILESTONE' AND recurrence_rule IS NULL)
        ),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

        -- orderIndex must be unique per journey (DB-level guarantee, not just app)
        UNIQUE (journey_id, order_index)
      );

      CREATE INDEX idx_task_definitions_journey_id ON task_definitions (journey_id);
    `);
        // ── feature_flags ───────────────────────────────────────────────────────
        // Runtime feature toggles — admin endpoint flips these, ~30s TTL cache
        // means no redeploy needed. Currently: media_uploads toggle.
        await this.execute(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        key        TEXT        PRIMARY KEY,
        enabled    BOOLEAN     NOT NULL DEFAULT false,
        config     JSONB       NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Seed: media_uploads OFF by default (Phase 1 requirement)
      INSERT INTO feature_flags (key, enabled, config)
      VALUES ('media_uploads', false, '{"provider": "disabled"}')
      ON CONFLICT (key) DO NOTHING;
    `);
    }
    async down() {
        await this.execute(`
      DROP TABLE IF EXISTS task_definitions;
      DROP TABLE IF EXISTS journeys;
      DROP TABLE IF EXISTS user_profiles;
      DROP TABLE IF EXISTS feature_flags;
    `);
    }
}
exports.Migration0001_Foundation = Migration0001_Foundation;
//# sourceMappingURL=Migration0001_Foundation.js.map