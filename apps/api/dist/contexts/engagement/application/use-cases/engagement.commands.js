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
exports.UnlikeJourneyUseCase = exports.LikeJourneyUseCase = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const crypto_1 = require("crypto");
const like_aggregate_1 = require("../../domain/like.aggregate");
const like_repository_1 = require("../ports/like.repository");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const events_1 = require("../../../../shared-kernel/events");
let LikeJourneyUseCase = class LikeJourneyUseCase {
    likeRepo;
    eventBus;
    constructor(likeRepo, eventBus) {
        this.likeRepo = likeRepo;
        this.eventBus = eventBus;
    }
    async execute(cmd) {
        const journeyId = journey_id_vo_1.JourneyId.of(cmd.journeyId);
        const userId = user_id_vo_1.UserId.of(cmd.userId);
        // Idempotent: if already liked, silently return — no duplicate event emitted
        const existing = await this.likeRepo.find(journeyId, userId);
        if (existing)
            return;
        const like = new like_aggregate_1.Like({ id: (0, crypto_1.randomUUID)(), journeyId, userId });
        await this.likeRepo.save(like);
        this.eventBus.publish(new events_1.JourneyLikedEvent(cmd.journeyId, cmd.userId));
    }
};
exports.LikeJourneyUseCase = LikeJourneyUseCase;
exports.LikeJourneyUseCase = LikeJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(like_repository_1.LIKE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventBus])
], LikeJourneyUseCase);
let UnlikeJourneyUseCase = class UnlikeJourneyUseCase {
    likeRepo;
    eventBus;
    constructor(likeRepo, eventBus) {
        this.likeRepo = likeRepo;
        this.eventBus = eventBus;
    }
    async execute(cmd) {
        const journeyId = journey_id_vo_1.JourneyId.of(cmd.journeyId);
        const userId = user_id_vo_1.UserId.of(cmd.userId);
        // Idempotent: if not liked, silently return — no spurious event emitted
        const existing = await this.likeRepo.find(journeyId, userId);
        if (!existing)
            return;
        await this.likeRepo.delete(existing);
        this.eventBus.publish(new events_1.JourneyUnlikedEvent(cmd.journeyId, cmd.userId));
    }
};
exports.UnlikeJourneyUseCase = UnlikeJourneyUseCase;
exports.UnlikeJourneyUseCase = UnlikeJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(like_repository_1.LIKE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventBus])
], UnlikeJourneyUseCase);
//# sourceMappingURL=engagement.commands.js.map