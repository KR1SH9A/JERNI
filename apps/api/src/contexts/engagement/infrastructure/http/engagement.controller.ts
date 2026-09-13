import {
  Controller,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { LikeJourneyUseCase, UnlikeJourneyUseCase } from '../../application/use-cases/engagement.commands';

@ApiTags('Engagement')
@Controller('journeys/:id/likes')
@ApiBearerAuth()
export class EngagementController {
  constructor(
    private readonly likeJourney: LikeJourneyUseCase,
    private readonly unlikeJourney: UnlikeJourneyUseCase,
  ) {}

  /**
   * POST /journeys/:id/likes — Like a journey.
   * Idempotent: liking twice is a no-op (no error, no duplicate row).
   */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Like a journey (idempotent)' })
  async like(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.likeJourney.execute({ journeyId, userId: user.id });
  }

  /**
   * DELETE /journeys/:id/likes — Unlike a journey.
   * Idempotent: unliking when not liked is a no-op.
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a journey (idempotent)' })
  async unlike(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.unlikeJourney.execute({ journeyId, userId: user.id });
  }
}
