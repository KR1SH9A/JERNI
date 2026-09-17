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
exports.ArchiveJourneyUseCase = exports.UpdateJourneyUseCase = exports.PublishJourneyUseCase = exports.AddTaskDefinitionUseCase = exports.CreateJourneyUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const journey_aggregate_1 = require("../../domain/journey.aggregate");
const task_definition_entity_1 = require("../../domain/task-definition.entity");
const journey_repository_1 = require("../ports/journey.repository");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const domain_error_1 = require("../../../../shared-kernel/errors/domain.error");
let CreateJourneyUseCase = class CreateJourneyUseCase {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(cmd) {
        const journey = new journey_aggregate_1.Journey({
            id: journey_id_vo_1.JourneyId.of((0, crypto_1.randomUUID)()),
            curatorId: user_id_vo_1.UserId.of(cmd.curatorId),
            title: cmd.title,
            description: cmd.description,
            tags: cmd.tags,
            visibility: cmd.visibility ?? 'PUBLIC',
            status: 'DRAFT',
        });
        await this.journeyRepo.save(journey);
        return journey;
    }
};
exports.CreateJourneyUseCase = CreateJourneyUseCase;
exports.CreateJourneyUseCase = CreateJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateJourneyUseCase);
let AddTaskDefinitionUseCase = class AddTaskDefinitionUseCase {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(cmd) {
        const journey = await this.journeyRepo.findById(journey_id_vo_1.JourneyId.of(cmd.journeyId));
        if (!journey) {
            throw new common_1.NotFoundException(`Journey ${cmd.journeyId} not found`);
        }
        // Authorization: only the curator can add tasks
        if (!journey.isCurator(user_id_vo_1.UserId.of(cmd.requestedBy))) {
            throw new domain_error_1.DomainError('Only the curator can add tasks to this journey.', 'UNAUTHORIZED_ACTION');
        }
        // Get the next available orderIndex (repository helper)
        const nextIndex = await this.journeyRepo.nextOrderIndex(journey_id_vo_1.JourneyId.of(cmd.journeyId));
        const task = new task_definition_entity_1.TaskDefinition({
            id: (0, crypto_1.randomUUID)(),
            journeyId: cmd.journeyId,
            title: cmd.title,
            orderIndex: nextIndex,
            kind: cmd.kind,
            recurrenceRule: cmd.recurrenceRule,
        });
        // addTask() enforces all domain invariants (archived check, orderIndex uniqueness)
        journey.addTask(task);
        await this.journeyRepo.save(journey);
        return journey;
    }
};
exports.AddTaskDefinitionUseCase = AddTaskDefinitionUseCase;
exports.AddTaskDefinitionUseCase = AddTaskDefinitionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], AddTaskDefinitionUseCase);
let PublishJourneyUseCase = class PublishJourneyUseCase {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(cmd) {
        const journey = await this.journeyRepo.findById(journey_id_vo_1.JourneyId.of(cmd.journeyId));
        if (!journey) {
            throw new common_1.NotFoundException(`Journey ${cmd.journeyId} not found`);
        }
        if (!journey.isCurator(user_id_vo_1.UserId.of(cmd.requestedBy))) {
            throw new domain_error_1.DomainError('Only the curator can publish this journey.', 'UNAUTHORIZED_ACTION');
        }
        // publish() enforces: must be DRAFT, must have tasks
        journey.publish();
        await this.journeyRepo.save(journey);
        return journey;
    }
};
exports.PublishJourneyUseCase = PublishJourneyUseCase;
exports.PublishJourneyUseCase = PublishJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PublishJourneyUseCase);
let UpdateJourneyUseCase = class UpdateJourneyUseCase {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(cmd) {
        const journey = await this.journeyRepo.findById(journey_id_vo_1.JourneyId.of(cmd.journeyId));
        if (!journey) {
            throw new common_1.NotFoundException(`Journey ${cmd.journeyId} not found`);
        }
        if (!journey.isCurator(user_id_vo_1.UserId.of(cmd.requestedBy))) {
            throw new domain_error_1.DomainError('Only the curator can edit this journey.', 'UNAUTHORIZED_ACTION');
        }
        if (journey.status !== 'DRAFT') {
            throw new domain_error_1.DomainError(`Only DRAFT journeys can be edited. Current status: ${journey.status}.`, 'JOURNEY_NOT_DRAFT');
        }
        // Apply only supplied fields
        if (cmd.title !== undefined)
            journey.title = cmd.title;
        if (cmd.description !== undefined)
            journey.description = cmd.description;
        if (cmd.tags !== undefined)
            journey.tags = cmd.tags;
        if (cmd.visibility !== undefined)
            journey.visibility = cmd.visibility;
        journey.updatedAt = new Date();
        await this.journeyRepo.save(journey);
        return journey;
    }
};
exports.UpdateJourneyUseCase = UpdateJourneyUseCase;
exports.UpdateJourneyUseCase = UpdateJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateJourneyUseCase);
let ArchiveJourneyUseCase = class ArchiveJourneyUseCase {
    journeyRepo;
    constructor(journeyRepo) {
        this.journeyRepo = journeyRepo;
    }
    async execute(cmd) {
        const journey = await this.journeyRepo.findById(journey_id_vo_1.JourneyId.of(cmd.journeyId));
        if (!journey) {
            throw new common_1.NotFoundException(`Journey ${cmd.journeyId} not found`);
        }
        if (!journey.isCurator(user_id_vo_1.UserId.of(cmd.requestedBy))) {
            throw new domain_error_1.DomainError('Only the curator can archive this journey.', 'UNAUTHORIZED_ACTION');
        }
        // archive() enforces: must be PUBLISHED
        journey.archive();
        await this.journeyRepo.save(journey);
        return journey;
    }
};
exports.ArchiveJourneyUseCase = ArchiveJourneyUseCase;
exports.ArchiveJourneyUseCase = ArchiveJourneyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ArchiveJourneyUseCase);
//# sourceMappingURL=journey.commands.js.map