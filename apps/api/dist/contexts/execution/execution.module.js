"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const curation_module_1 = require("../curation/curation.module");
const participation_module_1 = require("../participation/participation.module");
const task_completion_repository_1 = require("./application/ports/task-completion.repository");
const execution_commands_1 = require("./application/use-cases/execution.commands");
const execution_queries_1 = require("./application/use-cases/execution.queries");
const task_completion_orm_entity_1 = require("./infrastructure/persistence/task-completion.orm-entity");
const mikro_orm_task_completion_repository_1 = require("./infrastructure/persistence/mikro-orm-task-completion.repository");
const execution_controller_1 = require("./infrastructure/http/execution.controller");
let ExecutionModule = class ExecutionModule {
};
exports.ExecutionModule = ExecutionModule;
exports.ExecutionModule = ExecutionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_1.MikroOrmModule.forFeature([task_completion_orm_entity_1.TaskCompletionOrmEntity]),
            // JOURNEY_REPOSITORY: to verify journey is PUBLISHED and find task definitions
            curation_module_1.CurationModule,
            // MEMBERSHIP_REPOSITORY: to guard that the user is an active member before completing
            participation_module_1.ParticipationModule,
        ],
        providers: [
            { provide: task_completion_repository_1.TASK_COMPLETION_REPOSITORY, useClass: mikro_orm_task_completion_repository_1.MikroOrmTaskCompletionRepository },
            execution_commands_1.CompleteTaskUseCase,
            execution_commands_1.UncompleteTaskUseCase,
            execution_queries_1.GetMyProgressQuery,
        ],
        controllers: [execution_controller_1.ExecutionController],
        exports: [task_completion_repository_1.TASK_COMPLETION_REPOSITORY, execution_queries_1.GetMyProgressQuery],
    })
], ExecutionModule);
//# sourceMappingURL=execution.module.js.map