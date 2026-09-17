import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../identity/infrastructure/decorators/public.decorator';
import { GetJourneyStatsQuery } from '../../application/use-cases/stats.queries';

@ApiTags('Stats')
@Controller('journeys')
export class StatsController {
  constructor(private readonly getStats: GetJourneyStatsQuery) {}

  /**
   * GET /journeys/:id/stats
   *
   * Returns:
   *  - todayBoard: all members' task completion counts for today
   *  - allTimeLeaderboard: all-time milestone completion ranking
   *
   * Public — no auth required for public journeys.
   * The read model contains no private data (no completion details, just counts).
   */
  @Public()
  @Get(':id/stats')
  @ApiOperation({ summary: 'Journey stats — today board + all-time leaderboard' })
  async getJourneyStats(@Param('id', ParseUUIDPipe) journeyId: string) {
    return this.getStats.execute(journeyId);
  }
}
