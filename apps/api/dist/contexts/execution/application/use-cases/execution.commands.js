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
exports.UncompleteTaskUseCase = exports.CompleteTaskUseCase = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const crypto_1 = require("crypto");
const task_completion_aggregate_1 = require("../../domain/task-completion.aggregate");
const task_completion_repository_1 = require("../ports/task-completion.repository");
const membership_repository_1 = require("../../../participation/application/ports/membership.repository");
const journey_repository_1 = require("../../../curation/application/ports/journey.repository");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const domain_error_1 = require("../../../../shared-kernel/errors/domain.error");
const events_1 = require("../../../../shared-kernel/events");
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Returns today's date as 'YYYY-MM-DD' in UTC. Recurring completions are scoped to this. */
function todayUtc() {
    return new Date().toISOString().split('T')[0];
}
let CompleteTaskUseCase = class CompleteTaskUseCase {
    journeyRepo;
    membershipRepo;
    completionRepo;
    eventBus;
    constructor(journeyRepo, membershipRepo, completionRepo, eventBus) {
        this.journeyRepo = journeyRepo;
        this.membershipRepo = membershipRepo;
        this.completionRepo = completionRepo;
        this.eventBus = eventBus;
    }
    async execute(cmd) {
        const journeyId = journey_id_vo_1.JourneyId.of(cmd.journeyId);
        const userId = user_id_vo_1.UserId.of(cmd.userId);
        // 1. Load journey — must be PUBLISHED
        const journey = await this.journeyRepo.findById(journeyId);
        if (!journey) {
            throw new common_1.NotFoundException(`Journey ${cmd.journeyId} not found`);
        }
        if (journey.status !== 'PUBLISHED') {
            throw new domain_error_1.DomainError('Cannot complete tasks on an unpublished journey.', 'JOURNEY_NOT_PUBLISHED');
        }
        // 2. Verify the user is an active member
        const membership = await this.membershipRepo.findActive(journeyId, userId);
        if (!membership) {
            throw new domain_error_1.DomainError('You must be a member of this journey to complete tasks.', 'NOT_A_MEMBER');
        }
        // 3. Find the task definition — snapshot its kind at this moment
        const taskDef = journey.taskDefinitions.find((t) => t.id === cmd.taskDefinitionId);
        if (!taskDef) {
            throw new common_1.NotFoundException(`Task ${cmd.taskDefinitionId} not found on journey ${cmd.journeyId}`);
        }
        // 4. Determine forDate based on task kind (snapshot happens here)
        const forDate = taskDef.kind === 'RECURRING' ? todayUtc() : null;
        // 5. Guard against duplicate active completion
        const existing = await this.completionRepo.findActive(journeyId, userId, cmd.taskDefinitionId, forDate);
        if (existing) {
            throw new domain_error_1.DomainError('This task has already been completed.', 'TASK_ALREADY_COMPLETED');
        }
        // 6. Create the completion (domain factory validates forDate/kind consistency)
        const completion = task_completion_aggregate_1.TaskCompletion.create({
            id: (0, crypto_1.randomUUID)(),
            journeyId,
            userId,
            taskDefinitionId: cmd.taskDefinitionId,
            taskKindSnapshot: taskDef.kind, // ← snapshot at completion time
            forDate,
        });
        await this.completionRepo.save(completion);
        this.eventBus.publish(new events_1.TaskCompletedEvent(cmd.journeyId, cmd.userId, cmd.taskDefinitionId, taskDef.kind, forDate));
        return completion;
    }
};
exports.CompleteTaskUseCase = CompleteTaskUseCase;
exports.CompleteTaskUseCase = CompleteTaskUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(journey_repository_1.JOURNEY_REPOSITORY)),
    __param(1, (0, common_1.Inject)(membership_repository_1.MEMBERSHIP_REPOSITORY)),
    __param(2, (0, common_1.Inject)(task_completion_repository_1.TASK_COMPLETION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, cqrs_1.EventBus])
], CompleteTaskUseCase);
let UncompleteTaskUseCase = class UncompleteTaskUseCase {
    membershipRepo;
    completionRepo;
    eventBus;
    constructor(membershipRepo, completionRepo, eventBus) {
        this.membershipRepo = membershipRepo;
        this.completionRepo = completionRepo;
        this.eventBus = eventBus;
    }
    async execute(cmd) {
        const journeyId = journey_id_vo_1.JourneyId.of(cmd.journeyId);
        const userId = user_id_vo_1.UserId.of(cmd.userId);
        // Verify membership
        const membership = await this.membershipRepo.findActive(journeyId, userId);
        if (!membership) {
            throw new domain_error_1.DomainError('You must be a member of this journey to uncomplete tasks.', 'NOT_A_MEMBER');
        }
        // For recurring tasks, forDate is always today (can only uncomplete today's completion)
        // We need to know the kind — find by trying both: null (milestone) first, then today (recurring)
        let completion = await this.completionRepo.findActive(journeyId, userId, cmd.taskDefinitionId, null);
        if (!completion) {
            completion = await this.completionRepo.findActive(journeyId, userId, cmd.taskDefinitionId, todayUtc());
        }
        if (!completion) {
            throw new common_1.NotFoundException(`No active completion found for task ${cmd.taskDefinitionId}`);
        }
        // uncomplete() enforces: cannot revoke twice
        completion.uncomplete();
        await this.completionRepo.save(completion);
        this.eventBus.publish(new events_1.TaskUncompletedEvent(cmd.journeyId, cmd.userId, cmd.taskDefinitionId, completion.forDate));
    }
};
exports.UncompleteTaskUseCase = UncompleteTaskUseCase;
exports.UncompleteTaskUseCase = UncompleteTaskUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(membership_repository_1.MEMBERSHIP_REPOSITORY)),
    __param(1, (0, common_1.Inject)(task_completion_repository_1.TASK_COMPLETION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, cqrs_1.EventBus])
], UncompleteTaskUseCase);
//# sourceMappingURL=execution.commands.js.map