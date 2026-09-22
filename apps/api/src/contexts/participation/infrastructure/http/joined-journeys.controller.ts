import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { GetJoinedJourneysQuery } from '../../application/use-cases/participation.queries';

@ApiTags('Participation')
@Controller('journeys/joined')
@ApiBearerAuth()
export class JoinedJourneysController {
  constructor(
    private readonly getJoinedJourneys: GetJoinedJourneysQuery,
  ) { }

  /**
   * GET /journeys/joined — Get all journeys the user has joined
   */
  @Get()
  @ApiOperation({ summary: 'Get all active joined journeys for the current user' })
  async getJoined(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.getJoinedJourneys.execute(user.id);
  }
}
