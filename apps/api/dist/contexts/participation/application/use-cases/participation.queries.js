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
exports.GetMembershipStatusQuery = void 0;
const common_1 = require("@nestjs/common");
const membership_repository_1 = require("../ports/membership.repository");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
let GetMembershipStatusQuery = class GetMembershipStatusQuery {
    membershipRepo;
    constructor(membershipRepo) {
        this.membershipRepo = membershipRepo;
    }
    async execute(journeyId, userId) {
        const membership = await this.membershipRepo.findActive(journey_id_vo_1.JourneyId.of(journeyId), user_id_vo_1.UserId.of(userId));
        return { isMember: membership !== null };
    }
};
exports.GetMembershipStatusQuery = GetMembershipStatusQuery;
exports.GetMembershipStatusQuery = GetMembershipStatusQuery = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(membership_repository_1.MEMBERSHIP_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetMembershipStatusQuery);
//# sourceMappingURL=participation.queries.js.map