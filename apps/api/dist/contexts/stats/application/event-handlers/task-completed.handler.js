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
exports.TaskCompletedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const events_1 = require("../../../../shared-kernel/events");
const stats_repository_1 = require("../ports/stats.repository");
/**
 * TaskCompletedHandler — CQRS event handler that projects TaskCompletedEvent
 * into the Stats read model.
 *
 * Two writes per event (both upserts, atomic at DB level):
 *  1. daily_stats — set/increment completedCount for this (journey, user, task, date)
 *  2. all_time_stats — increment milestones_completed or recurring_done_today
 *
 * forDate on the event is:
 *  - null  for MILESTONE tasks (we use today's date for daily_stats)
 *  - 'YYYY-MM-DD' for RECURRING tasks
 *
 * NOTE: both DB operations are independent. If one fails, the handler will
 * throw and NestJS CQRS will not retry by default. For production resiliency,
 * add an outbox / saga — Phase 4 concern. At current scale, the risk is
 * acceptable because stats are rebuildable from task_completions.
 */
let TaskCompletedHandler = class TaskCompletedHandler {
    statsRepo;
    constructor(statsRepo) {
        this.statsRepo = statsRepo;
    }
    async handle(event) {
        // Use the event's forDate for RECURRING; today for MILESTONE (MILESTONE has forDate=null)
        const forDate = event.forDate ?? new Date().toISOString().split('T')[0];
        await Promise.all([
            this.statsRepo.upsertDailyStat(event.journeyId, event.userId, event.taskDefinitionId, forDate, 1),
            this.statsRepo.upsertAllTimeStat(event.journeyId, event.userId, event.taskKind, event.forDate, 1),
        ]);
    }
};
exports.TaskCompletedHandler = TaskCompletedHandler;
exports.TaskCompletedHandler = TaskCompletedHandler = __decorate([
    (0, cqrs_1.EventsHandler)(events_1.TaskCompletedEvent),
    __param(0, (0, common_1.Inject)(stats_repository_1.STATS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], TaskCompletedHandler);
//# sourceMappingURL=task-completed.handler.js.map