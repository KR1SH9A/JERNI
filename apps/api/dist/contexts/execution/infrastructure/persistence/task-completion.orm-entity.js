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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCompletionOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
let TaskCompletionOrmEntity = class TaskCompletionOrmEntity {
    id;
    journeyId;
    userId;
    taskDefinitionId;
    taskKindSnapshot;
    /**
     * ISO date string 'YYYY-MM-DD' for RECURRING tasks; null for MILESTONE.
     * The DB unique constraint treats NULL = NULL (NULLS NOT DISTINCT),
     * so two milestone completions for the same task will violate the constraint.
     */
    forDate = null;
    completedAt = new Date();
    revokedAt = null;
};
exports.TaskCompletionOrmEntity = TaskCompletionOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], TaskCompletionOrmEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid', fieldName: 'journey_id' }),
    __metadata("design:type", String)
], TaskCompletionOrmEntity.prototype, "journeyId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', fieldName: 'user_id' }),
    __metadata("design:type", String)
], TaskCompletionOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid', fieldName: 'task_definition_id' }),
    __metadata("design:type", String)
], TaskCompletionOrmEntity.prototype, "taskDefinitionId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', fieldName: 'task_kind_snapshot' }),
    __metadata("design:type", String)
], TaskCompletionOrmEntity.prototype, "taskKindSnapshot", void 0);
__decorate([
    (0, core_1.Property)({ type: 'date', nullable: true, fieldName: 'for_date' }),
    __metadata("design:type", Object)
], TaskCompletionOrmEntity.prototype, "forDate", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', fieldName: 'completed_at' }),
    __metadata("design:type", Date)
], TaskCompletionOrmEntity.prototype, "completedAt", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', nullable: true, fieldName: 'revoked_at' }),
    __metadata("design:type", Object)
], TaskCompletionOrmEntity.prototype, "revokedAt", void 0);
exports.TaskCompletionOrmEntity = TaskCompletionOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'task_completions' })
], TaskCompletionOrmEntity);
//# sourceMappingURL=task-completion.orm-entity.js.map