import { EntityRepository } from '@mikro-orm/core';
import { StatsRepository, JourneyStatsReadModel } from '../../application/ports/stats.repository';
import { DailyStatOrmEntity } from './daily-stat.orm-entity';
import { AllTimeStatOrmEntity } from './all-time-stat.orm-entity';
export declare class MikroOrmStatsRepository implements StatsRepository {
    private readonly dailyRepo;
    private readonly allTimeRepo;
    constructor(dailyRepo: EntityRepository<DailyStatOrmEntity>, allTimeRepo: EntityRepository<AllTimeStatOrmEntity>);
    /**
     * Upsert daily stat with a raw SQL query for atomic increment/decrement.
     * Uses ON CONFLICT DO UPDATE so it is safe under concurrency.
     */
    upsertDailyStat(journeyId: string, userId: string, taskDefinitionId: string, forDate: string, delta: 1 | -1): Promise<void>;
    /**
     * Upsert all-time stat.
     * - MILESTONE: increment/decrement milestones_completed
     * - RECURRING: increment/decrement recurring_done_today
     *
     * displayName is set on INSERT. On conflict (row exists), only the counter changes.
     * displayName is fetched from user_profiles at insert time via a subquery.
     */
    upsertAllTimeStat(journeyId: string, userId: string, taskKind: 'MILESTONE' | 'RECURRING', _forDate: string | null, delta: 1 | -1): Promise<void>;
    /**
     * Returns the today board (all members' completions for today) and
     * the all-time leaderboard, sorted by milestones_completed DESC.
     *
     * totalTasks is fetched from task_definitions via a subquery — cached
     * at the ORM level in the journey aggregate for most callers, but we
     * query directly here to keep Stats context self-contained.
     */
    getJourneyStats(journeyId: string, today: string): Promise<JourneyStatsReadModel>;
}
//# sourceMappingURL=mikro-orm-stats.repository.d.ts.map