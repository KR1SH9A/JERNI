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
exports.EngagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const engagement_commands_1 = require("../../application/use-cases/engagement.commands");
let EngagementController = class EngagementController {
    likeJourney;
    unlikeJourney;
    constructor(likeJourney, unlikeJourney) {
        this.likeJourney = likeJourney;
        this.unlikeJourney = unlikeJourney;
    }
    /**
     * POST /journeys/:id/likes — Like a journey.
     * Idempotent: liking twice is a no-op (no error, no duplicate row).
     */
    async like(journeyId, user) {
        await this.likeJourney.execute({ journeyId, userId: user.id });
    }
    /**
     * DELETE /journeys/:id/likes — Unlike a journey.
     * Idempotent: unliking when not liked is a no-op.
     */
    async unlike(journeyId, user) {
        await this.unlikeJourney.execute({ journeyId, userId: user.id });
    }
};
exports.EngagementController = EngagementController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Like a journey (idempotent)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "like", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Unlike a journey (idempotent)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EngagementController.prototype, "unlike", null);
exports.EngagementController = EngagementController = __decorate([
    (0, swagger_1.ApiTags)('Engagement'),
    (0, common_1.Controller)('journeys/:id/likes'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [engagement_commands_1.LikeJourneyUseCase,
        engagement_commands_1.UnlikeJourneyUseCase])
], EngagementController);
//# sourceMappingURL=engagement.controller.js.map