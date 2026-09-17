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
exports.GetMyJourneysQuery = exports.GetJourneyDetailQuery = exports.GetDiscoverFeedQuery = void 0;
const common_1 = require("@nestjs/common");
const journey_repository_1 = require("../ports/journey.repository");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
let GetDiscoverFeedQuery = class GetDiscoverFeedQuery {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(query) {
        const page = query.page ?? 1;
        const pageSize = Math.min(query.pageSize ?? 20, 50); // cap at 50
        const result = await this.journeyRepo.findPublicPublished({ tags: query.tags, search: query.search }, page, pageSize);
        return {
            journeys: result.data.map(this.toReadModel),
            total: result.total,
            page,
            pageSize,
        };
    }
    toReadModel(j) {
        return {
            id: j.id.value,
            curatorId: j.curatorId.value,
            title: j.title,
            description: j.description,
            tags: j.tags,
            status: j.status,
            visibility: j.visibility,
            coverProvider: j.coverProvider,
            coverAssetId: j.coverAssetId,
            likeCount: j.likeCount,
            taskCount: j.taskDefinitions.length,
            createdAt: j.createdAt,
        };
    }
};
exports.GetDiscoverFeedQuery = GetDiscoverFeedQuery;
exports.GetDiscoverFeedQuery = GetDiscoverFeedQuery = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetDiscoverFeedQuery);
let GetJourneyDetailQuery = class GetJourneyDetailQuery {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(journeyId) {
        const journey = await this.journeyRepo.findById(journey_id_vo_1.JourneyId.of(journeyId));
        if (!journey) {
            throw new common_1.NotFoundException(`Journey ${journeyId} not found`);
        }
        return {
            id: journey.id.value,
            curatorId: journey.curatorId.value,
            title: journey.title,
            description: journey.description,
            tags: journey.tags,
            status: journey.status,
            visibility: journey.visibility,
            coverProvider: journey.coverProvider,
            coverAssetId: journey.coverAssetId,
            likeCount: journey.likeCount,
            taskCount: journey.taskDefinitions.length,
            createdAt: journey.createdAt,
            tasks: journey.taskDefinitions.map((t) => ({
                id: t.id,
                title: t.title,
                orderIndex: t.orderIndex,
                kind: t.kind,
                recurrenceRule: t.recurrenceRule,
            })),
        };
    }
};
exports.GetJourneyDetailQuery = GetJourneyDetailQuery;
exports.GetJourneyDetailQuery = GetJourneyDetailQuery = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetJourneyDetailQuery);
let GetMyJourneysQuery = class GetMyJourneysQuery {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(curatorId) {
        const result = await this.journeyRepo.findByCuratorId(curatorId);
        return {
            journeys: result.map((item) => ({
                ...this.toReadModel(item.journey),
                memberCount: item.memberCount,
            })),
            total: result.length,
        };
    }
    toReadModel(j) {
        return {
            id: j.id.value,
            curatorId: j.curatorId.value,
            title: j.title,
            description: j.description,
            tags: j.tags,
            status: j.status,
            visibility: j.visibility,
            coverProvider: j.coverProvider,
            coverAssetId: j.coverAssetId,
            likeCount: j.likeCount,
            taskCount: j.taskDefinitions.length,
            createdAt: j.createdAt,
        };
    }
};
exports.GetMyJourneysQuery = GetMyJourneysQuery;
exports.GetMyJourneysQuery = GetMyJourneysQuery = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetMyJourneysQuery);
//# sourceMappingURL=journey.queries.js.map