import { Injectable, Inject } from '@nestjs/common';
import { StatsRepository, STATS_REPOSITORY, JourneyStatsReadModel } from '../ports/stats.repository';

@Injectable()
export class GetJourneyStatsQuery {
  constructor(
    @Inject(STATS_REPOSITORY)
    private readonly statsRepo: StatsRepository,
  ) {}

  async execute(journeyId: string): Promise<JourneyStatsReadModel> {
    const today = new Date().toISOString().split('T')[0];
    return this.statsRepo.getJourneyStats(journeyId, today);
  }
}
