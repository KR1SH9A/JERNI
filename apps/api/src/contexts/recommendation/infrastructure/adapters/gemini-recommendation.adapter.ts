import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import {
  RecommendationAiProvider,
  JourneyStub,
} from '../../application/ports/recommendation-ai.provider';

/**
 * Gemini-backed implementation of RecommendationAiProvider.
 *
 * Uses schema-constrained JSON output so we never need to parse freeform text.
 * The prompt explicitly restricts Gemini to select only from the provided catalog —
 * this prevents hallucinated Journey IDs from leaking through.
 */
@Injectable()
export class GeminiRecommendationAdapter implements RecommendationAiProvider {
  private readonly logger = new Logger(GeminiRecommendationAdapter.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async getRecommendations(
    interests: string,
    catalog: JourneyStub[],
    maxResults = 5,
  ): Promise<string[]> {
    if (catalog.length === 0) return [];

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            recommendedIds: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'Ordered list of journey IDs from the catalog that best match the user interests',
            },
          },
          required: ['recommendedIds'],
        },
      },
    });

    // Build a compact catalog representation — we never send full descriptions to Gemini
    const catalogText = catalog
      .map((j) => `ID: ${j.id} | Title: "${j.title}" | Tags: ${j.tags.join(', ')}`)
      .join('\n');

    const prompt = `You are a learning journey recommender for the JERNI platform.
    
A user has stated their interests as: "${interests}"

Below is the complete list of available public journeys. You MUST only select from this list.
Do NOT invent or hallucinate any IDs. Return exactly the ${maxResults} most relevant journey IDs, ordered by relevance (most relevant first).

AVAILABLE JOURNEYS:
${catalogText}

Return a JSON object with a "recommendedIds" array containing up to ${maxResults} journey IDs from the list above.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = JSON.parse(text) as { recommendedIds: string[] };

    if (!Array.isArray(parsed.recommendedIds)) {
      throw new Error('Gemini response missing recommendedIds array');
    }

    this.logger.debug(`Gemini returned ${parsed.recommendedIds.length} recommendations`);
    return parsed.recommendedIds.slice(0, maxResults);
  }
}
