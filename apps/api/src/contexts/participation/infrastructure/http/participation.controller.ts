import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { JoinJourneyUseCase, LeaveJourneyUseCase } from '../../application/use-cases/participation.commands';
import { GetMembershipStatusQuery } from '../../application/use-cases/participation.queries';

@ApiTags('Participation')
@Controller('journeys/:id/memberships')
@ApiBearerAuth()
export class ParticipationController {
  constructor(
    private readonly joinJourney: JoinJourneyUseCase,
    private readonly leaveJourney: LeaveJourneyUseCase,
    private readonly membershipStatus: GetMembershipStatusQuery,
  ) { }

  /**
   * POST /journeys/:id/memberships — Join a journey.
   * Anyone (including the curator) may join a published, public journey.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Join a journey' })
  async join(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const membership = await this.joinJourney.execute({ journeyId, userId: user.id });
    return { journeyId, userId: user.id, joinedAt: membership.joinedAt };
  }

  /**
   * DELETE /journeys/:id/memberships/me — Leave a journey.
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a journey' })
  async leave(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.leaveJourney.execute({ journeyId, userId: user.id });
  }

  /**
   * GET /journeys/:id/memberships/me — Check if the current user is a member.
   * Used by the frontend to seed join button state server-side.
   */
  @Get('me')
  @ApiOperation({ summary: 'Get my membership status for a journey' })
  async myStatus(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membershipStatus.execute(journeyId, user.id);
  }
}
