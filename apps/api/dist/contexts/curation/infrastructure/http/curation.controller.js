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
exports.CurationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../../identity/infrastructure/decorators/public.decorator");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const journey_commands_1 = require("../../application/use-cases/journey.commands");
const journey_queries_1 = require("../../application/use-cases/journey.queries");
const curation_dto_1 = require("./curation.dto");
let CurationController = class CurationController {
    createJourney;
    addTask;
    publishJourney;
    updateJourney;
    archiveJourney;
    discoverFeed;
    journeyDetail;
    myJourneys;
    constructor(createJourney, addTask, publishJourney, updateJourney, archiveJourney, discoverFeed, journeyDetail, myJourneys) {
        this.createJourney = createJourney;
        this.addTask = addTask;
        this.publishJourney = publishJourney;
        this.updateJourney = updateJourney;
        this.archiveJourney = archiveJourney;
        this.discoverFeed = discoverFeed;
        this.journeyDetail = journeyDetail;
        this.myJourneys = myJourneys;
    }
    // ── Public routes ────────────────────────────────────────────────────────
    /**
     * GET /journeys — Discover feed (public, no auth required).
     */
    async discover(page, pageSize, tags, search) {
        return this.discoverFeed.execute({ page, pageSize, tags, search });
    }
    /**
     * GET /journeys/:id — Journey detail (public, no auth required for public journeys).
     */
    async getDetail(id) {
        return this.journeyDetail.execute(id);
    }
    // ── Authenticated routes ─────────────────────────────────────────────────
    /**
     * GET /journeys/mine — Curator's own journeys (all statuses) with live member count.
     *
     * NOTE: this must be defined BEFORE :id routes or NestJS will try to parse
     * 'mine' as a UUID and fail. Order matters in NestJS route resolution.
     */
    async getMine(user) {
        return this.myJourneys.execute(user.id);
    }
    /**
     * POST /journeys — Curator creates a new journey.
     */
    async create(user, dto) {
        const journey = await this.createJourney.execute({
            curatorId: user.id,
            ...dto,
        });
        return { id: journey.id.value, status: journey.status };
    }
    /**
     * POST /journeys/:id/tasks — Curator adds a task to a journey.
     */
    async addTaskToJourney(journeyId, user, dto) {
        const journey = await this.addTask.execute({
            journeyId,
            requestedBy: user.id,
            ...dto,
        });
        return {
            journeyId: journey.id.value,
            taskCount: journey.taskDefinitions.length,
        };
    }
    /**
     * PATCH /journeys/:id/publish — Curator publishes a draft journey.
     */
    async publish(journeyId, user) {
        const journey = await this.publishJourney.execute({
            journeyId,
            requestedBy: user.id,
        });
        return { id: journey.id.value, status: journey.status };
    }
    /**
     * PATCH /journeys/:id — Curator edits a DRAFT journey's metadata.
     */
    async update(journeyId, user, dto) {
        const journey = await this.updateJourney.execute({
            journeyId,
            requestedBy: user.id,
            ...dto,
        });
        return { id: journey.id.value, status: journey.status, updatedAt: journey.updatedAt };
    }
    /**
     * POST /journeys/:id/archive — Curator archives a PUBLISHED journey.
     */
    async archive(journeyId, user) {
        const journey = await this.archiveJourney.execute({
            journeyId,
            requestedBy: user.id,
        });
        return { id: journey.id.value, status: journey.status };
    }
};
exports.CurationController = CurationController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Discover feed — public published journeys' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, type: [String] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('tags')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Array, String]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "discover", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get journey detail with tasks' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get the current user's journeys as curator" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "getMine", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new journey (curator only)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, curation_dto_1.CreateJourneyDto]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/tasks'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a task to a journey (curator only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, curation_dto_1.AddTaskDto]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "addTaskToJourney", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a draft journey (curator only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "publish", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a DRAFT journey (curator only, DRAFT journeys only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, curation_dto_1.UpdateJourneyDto]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a published journey (curator only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CurationController.prototype, "archive", null);
exports.CurationController = CurationController = __decorate([
    (0, swagger_1.ApiTags)('Journeys'),
    (0, common_1.Controller)('journeys'),
    __metadata("design:paramtypes", [journey_commands_1.CreateJourneyUseCase,
        journey_commands_1.AddTaskDefinitionUseCase,
        journey_commands_1.PublishJourneyUseCase,
        journey_commands_1.UpdateJourneyUseCase,
        journey_commands_1.ArchiveJourneyUseCase,
        journey_queries_1.GetDiscoverFeedQuery,
        journey_queries_1.GetJourneyDetailQuery,
        journey_queries_1.GetMyJourneysQuery])
], CurationController);
//# sourceMappingURL=curation.controller.js.map