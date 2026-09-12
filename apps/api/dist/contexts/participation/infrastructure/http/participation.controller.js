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
exports.ParticipationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const participation_commands_1 = require("../../application/use-cases/participation.commands");
const participation_queries_1 = require("../../application/use-cases/participation.queries");
let ParticipationController = class ParticipationController {
    joinJourney;
    leaveJourney;
    membershipStatus;
    constructor(joinJourney, leaveJourney, membershipStatus) {
        this.joinJourney = joinJourney;
        this.leaveJourney = leaveJourney;
        this.membershipStatus = membershipStatus;
    }
    /**
     * POST /journeys/:id/memberships — Join a journey.
     * Anyone (including the curator) may join a published, public journey.
     */
    async join(journeyId, user) {
        const membership = await this.joinJourney.execute({ journeyId, userId: user.id });
        return { journeyId, userId: user.id, joinedAt: membership.joinedAt };
    }
    /**
     * DELETE /journeys/:id/memberships/me — Leave a journey.
     */
    async leave(journeyId, user) {
        await this.leaveJourney.execute({ journeyId, userId: user.id });
    }
    /**
     * GET /journeys/:id/memberships/me — Check if the current user is a member.
     * Used by the frontend to seed join button state server-side.
     */
    async myStatus(journeyId, user) {
        return this.membershipStatus.execute(journeyId, user.id);
    }
};
exports.ParticipationController = ParticipationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Join a journey' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParticipationController.prototype, "join", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a journey' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParticipationController.prototype, "leave", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my membership status for a journey' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParticipationController.prototype, "myStatus", null);
exports.ParticipationController = ParticipationController = __decorate([
    (0, swagger_1.ApiTags)('Participation'),
    (0, common_1.Controller)('journeys/:id/memberships'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [participation_commands_1.JoinJourneyUseCase,
        participation_commands_1.LeaveJourneyUseCase,
        participation_queries_1.GetMembershipStatusQuery])
], ParticipationController);
//# sourceMappingURL=participation.controller.js.map