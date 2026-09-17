"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const nestjs_1 = require("@mikro-orm/nestjs");
const daily_stat_orm_entity_1 = require("./infrastructure/persistence/daily-stat.orm-entity");
const all_time_stat_orm_entity_1 = require("./infrastructure/persistence/all-time-stat.orm-entity");
const mikro_orm_stats_repository_1 = require("./infrastructure/persistence/mikro-orm-stats.repository");
const task_completed_handler_1 = require("./application/event-handlers/task-completed.handler");
const task_uncompleted_handler_1 = require("./application/event-handlers/task-uncompleted.handler");
const stats_queries_1 = require("./application/use-cases/stats.queries");
const stats_controller_1 = require("./infrastructure/http/stats.controller");
const stats_repository_1 = require("./application/ports/stats.repository");
let StatsModule = class StatsModule {
};
exports.StatsModule = StatsModule;
exports.StatsModule = StatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            nestjs_1.MikroOrmModule.forFeature([daily_stat_orm_entity_1.DailyStatOrmEntity, all_time_stat_orm_entity_1.AllTimeStatOrmEntity]),
        ],
        controllers: [stats_controller_1.StatsController],
        providers: [
            // Repository binding
            {
                provide: stats_repository_1.STATS_REPOSITORY,
                useClass: mikro_orm_stats_repository_1.MikroOrmStatsRepository,
            },
            // Event handlers
            task_completed_handler_1.TaskCompletedHandler,
            task_uncompleted_handler_1.TaskUncompletedHandler,
            // Queries
            stats_queries_1.GetJourneyStatsQuery,
        ],
    })
], StatsModule);
//# sourceMappingURL=stats.module.js.map