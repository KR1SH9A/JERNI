import { Migration } from '@mikro-orm/migrations';

/**
 * Migration 0004 — Phase 5: Recommendation logs table.
 *
 * Tracks every onboarding recommendation request for analytics and abuse detection.
 * This is a write-append log — never updated after insert.
 *
 * Skipped requests (skip=true) are logged with empty suggested_journey_ids
 * so we can distinguish "user engaged with onboarding" from "user skipped".
 */
export class Migration0004_RecommendationLogs extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS recommendation_logs (
        id                    UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id               TEXT      NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        interests_text        TEXT,
        suggested_journey_ids UUID[]    NOT NULL DEFAULT '{}',
        skipped               BOOLEAN   NOT NULL DEFAULT FALSE,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Index for per-user rate-limit queries and analytics
      CREATE INDEX idx_recommendation_logs_user_created
        ON recommendation_logs (user_id, created_at DESC);
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      DROP TABLE IF EXISTS recommendation_logs;
    `);
  }
}
