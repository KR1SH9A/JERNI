import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { LikeJourneyUseCase, UnlikeJourneyUseCase } from '../../application/use-cases/engagement.commands';
import { LikeRepository, LIKE_REPOSITORY } from '../../application/ports/like.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';

@ApiTags('Engagement')
@Controller('journeys/:id/likes')
@ApiBearerAuth()
export class EngagementController {
  constructor(
    private readonly likeJourney: LikeJourneyUseCase,
    private readonly unlikeJourney: UnlikeJourneyUseCase,
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepo: LikeRepository,
  ) {}

  /**
   * GET /journeys/:id/likes/me — Check if the current user has liked this journey.
   * Used by the journey detail page to seed initialIsLiked on the LikeButton.
   */
  @Get('me')
  @ApiOperation({ summary: 'Check if the current user has liked this journey' })
  async isLiked(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const like = await this.likeRepo.find(
      JourneyId.of(journeyId),
      UserId.of(user.id),
    );
    return { isLiked: like !== null };
  }

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
