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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../../identity/infrastructure/decorators/public.decorator");
const stats_queries_1 = require("../../application/use-cases/stats.queries");
let StatsController = class StatsController {
    getStats;
    constructor(getStats) {
        this.getStats = getStats;
    }
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
    async getJourneyStats(journeyId) {
        return this.getStats.execute(journeyId);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Journey stats — today board + all-time leaderboard' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getJourneyStats", null);
exports.StatsController = StatsController = __decorate([
    (0, swagger_1.ApiTags)('Stats'),
    (0, common_1.Controller)('journeys'),
    __metadata("design:paramtypes", [stats_queries_1.GetJourneyStatsQuery])
], StatsController);
//# sourceMappingURL=stats.controller.js.map