import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RECOMMENDATION_AI_PROVIDER } from './application/ports/recommendation-ai.provider';
import { GetRecommendationsUseCase } from './application/use-cases/get-recommendations.use-case';
import { GeminiRecommendationAdapter } from './infrastructure/adapters/gemini-recommendation.adapter';
import { RecommendationController } from './infrastructure/http/recommendation.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RECOMMENDATION_AI_PROVIDER,
      useClass: GeminiRecommendationAdapter,
    },
    GetRecommendationsUseCase,
  ],
  controllers: [RecommendationController],
})
export class RecommendationModule {}
