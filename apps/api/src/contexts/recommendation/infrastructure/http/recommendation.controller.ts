import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { GetRecommendationsUseCase } from '../../application/use-cases/get-recommendations.use-case';

class GetRecommendationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  interests?: string;

  @IsOptional()
  @IsBoolean()
  skip?: boolean;
}

@ApiTags('Onboarding')
@Controller('onboarding')
export class RecommendationController {
  constructor(
    private readonly getRecommendations: GetRecommendationsUseCase,
  ) {}

  /**
   * POST /onboarding/recommendations
   *
   * Rate-limited to 5 requests per user per hour to control Gemini API costs.
   * Skipping (skip: true) returns popular journeys with zero AI calls.
   */
  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-powered journey recommendations for onboarding' })
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  async recommend(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GetRecommendationsDto,
  ) {
    const result = await this.getRecommendations.execute({
      userId: user.id,
      interests: dto.interests,
      skip: dto.skip,
    });
    return {
      journeys: result.journeys,
      source: result.source,
    };
  }
}
