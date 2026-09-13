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
exports.LikeCountProjection = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const events_1 = require("../../../../shared-kernel/events");
const journey_repository_1 = require("../../application/ports/journey.repository");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
/**
 * LikeCountProjection — event handler that keeps the denormalized `likeCount`
 * on Journey aggregate in sync with the Engagement context's Like table.
 *
 * This is the ONLY cross-context coupling in Phase 2: Engagement publishes events,
 * Curation reacts by mutating its own aggregate. Engagement never touches
 * Curation's table directly, and Curation never reads Engagement's table directly.
 *
 * If this projection falls behind (e.g. a handler crash), likeCount can be
 * rebuilt from the likes table by replaying JourneyLiked events — it is never
 * the source of truth for "who liked what", only for fast card rendering.
 */
let LikeCountProjection = class LikeCountProjection {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async handle(event) {
        const journey = await this.journeyRepo.findById(journey_id_vo_1.JourneyId.of(event.journeyId));
        if (!journey)
            return; // Journey deleted between event publish and handling — safe to skip
        if (event instanceof events_1.JourneyLikedEvent) {
            journey.incrementLikeCount();
        }
        else {
            journey.decrementLikeCount();
        }
        await this.journeyRepo.save(journey);
    }
};
exports.LikeCountProjection = LikeCountProjection;
exports.LikeCountProjection = LikeCountProjection = __decorate([
    (0, cqrs_1.EventsHandler)(events_1.JourneyLikedEvent, events_1.JourneyUnlikedEvent),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], LikeCountProjection);
//# sourceMappingURL=like-count.projection.js.map