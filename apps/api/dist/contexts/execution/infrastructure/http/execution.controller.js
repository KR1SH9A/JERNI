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
exports.ExecutionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../identity/infrastructure/decorators/current-user.decorator");
const execution_commands_1 = require("../../application/use-cases/execution.commands");
const execution_queries_1 = require("../../application/use-cases/execution.queries");
let ExecutionController = class ExecutionController {
    completeTask;
    uncompleteTask;
    myProgress;
    constructor(completeTask, uncompleteTask, myProgress) {
        this.completeTask = completeTask;
        this.uncompleteTask = uncompleteTask;
        this.myProgress = myProgress;
    }
    /**
     * POST /journeys/:id/tasks/:taskId/complete — Mark a task as complete.
     * MILESTONE tasks: idempotent constraint via DB unique index (forDate = NULL).
     * RECURRING tasks: forDate = today (UTC). Can be done again tomorrow.
     */
    async complete(journeyId, taskDefinitionId, user) {
        const completion = await this.completeTask.execute({
            journeyId,
            taskDefinitionId,
            userId: user.id,
        });
        return {
            id: completion.id,
            taskDefinitionId: completion.taskDefinitionId,
            taskKindSnapshot: completion.taskKindSnapshot,
            forDate: completion.forDate,
            completedAt: completion.completedAt,
        };
    }
    /**
     * DELETE /journeys/:id/tasks/:taskId/complete — Uncomplete (soft-revoke) a task.
     * For recurring tasks, this only revokes today's completion.
     */
    async uncomplete(journeyId, taskDefinitionId, user) {
        await this.uncompleteTask.execute({
            journeyId,
            taskDefinitionId,
            userId: user.id,
        });
    }
    /**
     * GET /journeys/:id/progress/me — Get my completion progress for this journey.
     * Used by the frontend Server Component to seed task checkbox state.
     */
    async progress(journeyId, user) {
        return this.myProgress.execute(journeyId, user.id);
    }
};
exports.ExecutionController = ExecutionController;
__decorate([
    (0, common_1.Post)('tasks/:taskId/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a task (milestone or recurring)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('taskId', common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExecutionController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Uncomplete a task (soft revoke)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('taskId', common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExecutionController.prototype, "uncomplete", null);
__decorate([
    (0, common_1.Get)('progress/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my task completion progress for this journey' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExecutionController.prototype, "progress", null);
exports.ExecutionController = ExecutionController = __decorate([
    (0, swagger_1.ApiTags)('Execution'),
    (0, common_1.Controller)('journeys/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [execution_commands_1.CompleteTaskUseCase,
        execution_commands_1.UncompleteTaskUseCase,
        execution_queries_1.GetMyProgressQuery])
], ExecutionController);
//# sourceMappingURL=execution.controller.js.map