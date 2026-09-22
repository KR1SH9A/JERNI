/**
 * Port: RecommendationAiProvider
 *
 * A swappable interface for AI-driven journey recommendations.
 * The Gemini adapter implements this; a stub/disabled adapter also implements it —
 * neither the use case nor the controller knows which one is injected.
 */

export const RECOMMENDATION_AI_PROVIDER = Symbol('RECOMMENDATION_AI_PROVIDER');

export interface JourneyStub {
  id: string;
  title: string;
  tags: string[];
}

export interface RecommendationAiProvider {
  /**
   * Given a free-text interest string and a catalog of public journeys,
   * returns an ordered list of journey IDs from the catalog that best match.
   *
   * Contract:
   * - MUST only return IDs that are present in the `catalog` argument.
   * - MUST resolve within the caller's timeout budget (caller wraps in Promise.race).
   * - MAY return fewer than requested; MUST NOT return more than `maxResults`.
   * - On any internal error, MUST throw (caller handles fallback).
   */
  getRecommendations(
    interests: string,
    catalog: JourneyStub[],
    maxResults?: number,
  ): Promise<string[]>;
}
