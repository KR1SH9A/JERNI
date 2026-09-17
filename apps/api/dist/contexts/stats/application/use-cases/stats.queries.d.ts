import { StatsRepository, JourneyStatsReadModel } from '../ports/stats.repository';
export declare class GetJourneyStatsQuery {
    private readonly statsRepo;
    constructor(statsRepo: StatsRepository);
    execute(journeyId: string): Promise<JourneyStatsReadModel>;
}
//# sourceMappingURL=stats.queries.d.ts.map