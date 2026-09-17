import { GetJourneyStatsQuery } from '../../application/use-cases/stats.queries';
export declare class StatsController {
    private readonly getStats;
    constructor(getStats: GetJourneyStatsQuery);
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
    getJourneyStats(journeyId: string): Promise<import("../../application/ports/stats.repository").JourneyStatsReadModel>;
}
//# sourceMappingURL=stats.controller.d.ts.map