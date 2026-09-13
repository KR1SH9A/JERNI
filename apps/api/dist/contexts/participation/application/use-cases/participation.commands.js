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
exports.LeaveJourneyUseCase = exports.JoinJourneyUseCase = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const crypto_1 = require("crypto");
const membership_aggregate_1 = require("../../domain/membership.aggregate");
const membership_repository_1 = require("../ports/membership.repository");
const journey_repository_1 = require("../../../curation/application/ports/journey.repository");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const domain_error_1 = require("../../../../shared-kernel/errors/domain.error");
const events_1 = require("../../../../shared-kernel/events");
let JoinJourneyUseCase = class JoinJourneyUseCase {
    journeyRepo;
    membershipRepo;
    eventBus;
    constructor(journeyRepo, membershipRepo, eventBus) {
        this.journeyRepo = journeyRepo;
        this.membershipRepo = membershipRepo;
        this.eventBus = eventBus;
    }
    async execute(cmd) {
        const journeyId = journey_id_vo_1.JourneyId.of(cmd.journeyId);
        const userId = user_id_vo_1.UserId.of(cmd.userId);
        // Load journey and validate it can be joined
        const journey = await this.journeyRepo.findById(journeyId);
        if (!journey) {
            throw new common_1.NotFoundException(`Journey ${cmd.journeyId} not found`);
        }
        // canBeJoined() checks status === 'PUBLISHED' && visibility === 'PUBLIC'
        // Curator is allowed to join their own journey — no exception here
        if (!journey.canBeJoined()) {
            throw new domain_error_1.DomainError('This journey cannot be joined. It must be published and public.', 'JOURNEY_NOT_JOINABLE');
        }
        // Guard: already an active member?
        const existing = await this.membershipRepo.findActive(journeyId, userId);
        if (existing) {
            throw new domain_error_1.DomainError('You are already a member of this journey.', 'ALREADY_A_MEMBER');
        }
        const membership = new membership_aggregate_1.Membership({
            id: (0, crypto_1.randomUUID)(),
            journeyId,
            userId,
        });
        await this.membershipRepo.save(membership);
        this.eventBus.publish(new events_1.MemberJoinedEvent(cmd.journeyId, cmd.userId, membership.joinedAt));
        return membership;
    }
};
exports.JoinJourneyUseCase = JoinJourneyUseCase;
exports.JoinJourneyUseCase = JoinJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __param(1, (0, common_1.Inject)(membership_repository_1.MEMBERSHIP_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, cqrs_1.EventBus])
], JoinJourneyUseCase);
let LeaveJourneyUseCase = class LeaveJourneyUseCase {
    membershipRepo;
    eventBus;
    constructor(membershipRepo, eventBus) {
        this.membershipRepo = membershipRepo;
        this.eventBus = eventBus;
    }
    async execute(cmd) {
        const membership = await this.membershipRepo.findActive(journey_id_vo_1.JourneyId.of(cmd.journeyId), user_id_vo_1.UserId.of(cmd.userId));
        if (!membership) {
            throw new common_1.NotFoundException(`No active membership found for journey ${cmd.journeyId}`);
        }
        // leave() enforces: cannot leave twice
        membership.leave();
        await this.membershipRepo.save(membership);
        this.eventBus.publish(new events_1.MemberLeftEvent(cmd.journeyId, cmd.userId));
    }
};
exports.LeaveJourneyUseCase = LeaveJourneyUseCase;
exports.LeaveJourneyUseCase = LeaveJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(membership_repository_1.MEMBERSHIP_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventBus])
], LeaveJourneyUseCase);
//# sourceMappingURL=participation.commands.js.map