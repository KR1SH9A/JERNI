import { Injectable, Inject, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  RECOMMENDATION_AI_PROVIDER,
  RecommendationAiProvider,
  JourneyStub,
} from '../ports/recommendation-ai.provider';

export interface GetRecommendationsCommand {
  userId: string;
  interests?: string;
  skip?: boolean;
}

export interface RecommendationResult {
  journeys: JourneyStub[];
  source: 'ai' | 'popular' | 'skip';
}

@Injectable()
export class GetRecommendationsUseCase {
  private readonly logger = new Logger(GetRecommendationsUseCase.name);

  /** Gemini timeout budget in ms — onboarding must never feel blocked */
  private readonly AI_TIMEOUT_MS = 3_000;
  private readonly MAX_RESULTS = 5;

  constructor(
    @Inject(RECOMMENDATION_AI_PROVIDER)
    private readonly aiProvider: RecommendationAiProvider,
    private readonly em: EntityManager,
  ) {}

  async execute(cmd: GetRecommendationsCommand): Promise<RecommendationResult> {
    // Fast path: skip → return popular journeys immediately, zero AI call
    if (cmd.skip || !cmd.interests?.trim()) {
      const popular = await this.getPopularJourneys();
      await this.logRecommendation(cmd.userId, [], true, cmd.interests);
      return { journeys: popular.slice(0, this.MAX_RESULTS), source: 'skip' };
    }

    // Fetch the public catalog for Gemini to rank from (title + tags only)
    const catalog = await this.getPublicCatalog();
    if (catalog.length === 0) {
      return { journeys: [], source: 'ai' };
    }

    try {
      // Race against timeout budget
      const aiIds = await Promise.race([
        this.aiProvider.getRecommendations(cmd.interests, catalog, this.MAX_RESULTS),
        this.sleep(this.AI_TIMEOUT_MS).then(() => {
          throw new Error('AI recommendation timeout');
        }),
      ]);

      // Strict validation: only return IDs that actually exist in the catalog
      const catalogIdSet = new Set(catalog.map((j) => j.id));
      const validIds = aiIds.filter((id) => catalogIdSet.has(id)).slice(0, this.MAX_RESULTS);

      if (validIds.length === 0) {
        this.logger.warn('AI returned no valid IDs — falling back to popular');
        const popular = await this.getPopularJourneys();
        await this.logRecommendation(cmd.userId, [], false, cmd.interests);
        return { journeys: popular.slice(0, this.MAX_RESULTS), source: 'popular' };
      }

      // Map IDs back to stubs (preserving AI order)
      const catalogMap = new Map(catalog.map((j) => [j.id, j]));
      const recommended = validIds.map((id) => catalogMap.get(id)!);

      // Fire-and-forget log (never blocks response)
      this.logRecommendation(cmd.userId, validIds, false, cmd.interests).catch(() => {});

      return { journeys: recommended, source: 'ai' };
    } catch (err) {
      this.logger.warn(`AI recommendation failed: ${(err as Error).message} — using popular fallback`);
      const popular = await this.getPopularJourneys();
      await this.logRecommendation(cmd.userId, [], false, cmd.interests);
      return { journeys: popular.slice(0, this.MAX_RESULTS), source: 'popular' };
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  /** Fetch all public published journeys as lightweight stubs for the AI prompt. */
  private async getPublicCatalog(): Promise<JourneyStub[]> {
    const rows = await this.em.getConnection().execute<
      Array<{ id: string; title: string; tags: string[] | null }>
    >(
      `SELECT id, title, tags
       FROM journeys
       WHERE visibility = 'PUBLIC' AND status = 'PUBLISHED'
       ORDER BY created_at DESC
       LIMIT 50`,
    );
    return rows.map((r: { id: string; title: string; tags: string[] | null }) => ({ id: r.id, title: r.title, tags: r.tags ?? [] }));
  }

  /** Fallback: most-liked public published journeys. */
  private async getPopularJourneys(): Promise<JourneyStub[]> {
    const rows = await this.em.getConnection().execute<
      Array<{ id: string; title: string; tags: string[] | null }>
    >(
      `SELECT id, title, tags
       FROM journeys
       WHERE visibility = 'PUBLIC' AND status = 'PUBLISHED'
       ORDER BY like_count DESC, created_at DESC
       LIMIT 5`,
    );
    return rows.map((r: { id: string; title: string; tags: string[] | null }) => ({ id: r.id, title: r.title, tags: r.tags ?? [] }));
  }

  /** Async-safe log to recommendation_logs (never throws). */
  private async logRecommendation(
    userId: string,
    suggestedIds: string[],
    skipped: boolean,
    interests?: string,
  ): Promise<void> {
    try {
      await this.em.getConnection().execute(
        `INSERT INTO recommendation_logs
           (id, user_id, interests_text, suggested_journey_ids, skipped, created_at)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, now())`,
        [userId, interests ?? null, JSON.stringify(suggestedIds), skipped],
      );
    } catch (e) {
      this.logger.warn(`Failed to log recommendation: ${(e as Error).message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
