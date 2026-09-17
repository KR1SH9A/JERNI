"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MikroOrmStatsRepository = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const daily_stat_orm_entity_1 = require("./daily-stat.orm-entity");
const all_time_stat_orm_entity_1 = require("./all-time-stat.orm-entity");
let MikroOrmStatsRepository = class MikroOrmStatsRepository {
    dailyRepo;
    allTimeRepo;
    constructor(dailyRepo, allTimeRepo) {
        this.dailyRepo = dailyRepo;
        this.allTimeRepo = allTimeRepo;
    }
    /**
     * Upsert daily stat with a raw SQL query for atomic increment/decrement.
     * Uses ON CONFLICT DO UPDATE so it is safe under concurrency.
     */
    async upsertDailyStat(journeyId, userId, taskDefinitionId, forDate, delta) {
        const em = this.dailyRepo.getEntityManager();
        await em.getConnection().execute(`
      INSERT INTO daily_stats (journey_id, user_id, task_definition_id, for_date, completed_count)
      VALUES (?, ?, ?, ?, GREATEST(0, ?))
      ON CONFLICT (journey_id, user_id, task_definition_id, for_date)
      DO UPDATE SET
        completed_count = GREATEST(0, daily_stats.completed_count + ?)
      `, [journeyId, userId, taskDefinitionId, forDate, Math.max(0, delta), delta]);
    }
    /**
     * Upsert all-time stat.
     * - MILESTONE: increment/decrement milestones_completed
     * - RECURRING: increment/decrement recurring_done_today
     *
     * displayName is set on INSERT. On conflict (row exists), only the counter changes.
     * displayName is fetched from user_profiles at insert time via a subquery.
     */
    async upsertAllTimeStat(journeyId, userId, taskKind, _forDate, delta) {
        const em = this.allTimeRepo.getEntityManager();
        const isMilestone = taskKind === 'MILESTONE';
        await em.getConnection().execute(`
      INSERT INTO all_time_stats
        (journey_id, user_id, display_name, milestones_completed, recurring_done_today)
      VALUES (
        ?,
        ?,
        COALESCE((SELECT display_name FROM user_profiles WHERE id = ?), ''),
        ?,
        ?
      )
      ON CONFLICT (journey_id, user_id)
      DO UPDATE SET
        milestones_completed  = GREATEST(0, all_time_stats.milestones_completed  + ?),
        recurring_done_today  = GREATEST(0, all_time_stats.recurring_done_today  + ?)
      `, [
            journeyId,
            userId,
            userId,
            // INSERT values
            isMilestone ? Math.max(0, delta) : 0,
            isMilestone ? 0 : Math.max(0, delta),
            // UPDATE deltas
            isMilestone ? delta : 0,
            isMilestone ? 0 : delta,
        ]);
    }
    /**
     * Returns the today board (all members' completions for today) and
     * the all-time leaderboard, sorted by milestones_completed DESC.
     *
     * totalTasks is fetched from task_definitions via a subquery — cached
     * at the ORM level in the journey aggregate for most callers, but we
     * query directly here to keep Stats context self-contained.
     */
    async getJourneyStats(journeyId, today) {
        const em = this.dailyRepo.getEntityManager();
        // ── Today board ───────────────────────────────────────────────────────────
        const totalTasksResult = await em.getConnection().execute(`SELECT COUNT(*) AS count FROM task_definitions WHERE journey_id = ?`, [journeyId]);
        const totalTasks = parseInt(totalTasksResult[0]?.count ?? '0', 10);
        const dailyRows = await em.getConnection().execute(`
      SELECT
        d.user_id,
        COALESCE(a.display_name, up.display_name, d.user_id) AS display_name,
        SUM(d.completed_count) AS completed_today
      FROM daily_stats d
      LEFT JOIN all_time_stats a ON a.journey_id = d.journey_id AND a.user_id = d.user_id
      LEFT JOIN user_profiles up ON up.id = d.user_id
      WHERE d.journey_id = ? AND d.for_date = ?
      GROUP BY d.user_id, a.display_name, up.display_name
      ORDER BY completed_today DESC
      `, [journeyId, today]);
        const todayBoard = dailyRows.map((r) => ({
            userId: r.user_id,
            displayName: r.display_name,
            completedToday: parseInt(r.completed_today, 10),
            totalTasks,
        }));
        // ── All-time leaderboard ──────────────────────────────────────────────────
        const allTimeRows = await em.getConnection().execute(`
      SELECT user_id, display_name, milestones_completed, recurring_done_today
      FROM all_time_stats
      WHERE journey_id = ?
      ORDER BY milestones_completed DESC, recurring_done_today DESC
      LIMIT 50
      `, [journeyId]);
        const allTimeLeaderboard = allTimeRows.map((r) => ({
            userId: r.user_id,
            displayName: r.display_name,
            milestonesCompleted: r.milestones_completed,
            recurringDoneToday: r.recurring_done_today,
        }));
        return { journeyId, todayBoard, allTimeLeaderboard };
    }
};
exports.MikroOrmStatsRepository = MikroOrmStatsRepository;
exports.MikroOrmStatsRepository = MikroOrmStatsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(daily_stat_orm_entity_1.DailyStatOrmEntity)),
    __param(1, (0, nestjs_1.InjectRepository)(all_time_stat_orm_entity_1.AllTimeStatOrmEntity)),
    __metadata("design:paramtypes", [core_1.EntityRepository,
        core_1.EntityRepository])
], MikroOrmStatsRepository);
//# sourceMappingURL=mikro-orm-stats.repository.js.map