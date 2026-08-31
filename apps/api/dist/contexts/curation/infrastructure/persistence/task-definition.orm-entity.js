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
exports.TaskDefinitionOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
const journey_orm_entity_1 = require("./journey.orm-entity");
let TaskDefinitionOrmEntity = class TaskDefinitionOrmEntity {
    id;
    journey;
    title;
    orderIndex;
    kind;
    recurrenceRule = null;
    createdAt = new Date();
};
exports.TaskDefinitionOrmEntity = TaskDefinitionOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], TaskDefinitionOrmEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => journey_orm_entity_1.JourneyOrmEntity, { fieldName: 'journey_id' }),
    __metadata("design:type", journey_orm_entity_1.JourneyOrmEntity)
], TaskDefinitionOrmEntity.prototype, "journey", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], TaskDefinitionOrmEntity.prototype, "title", void 0);
__decorate([
    (0, core_1.Property)({ type: 'integer', fieldName: 'order_index' }),
    __metadata("design:type", Number)
], TaskDefinitionOrmEntity.prototype, "orderIndex", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], TaskDefinitionOrmEntity.prototype, "kind", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', nullable: true, fieldName: 'recurrence_rule' }),
    __metadata("design:type", Object)
], TaskDefinitionOrmEntity.prototype, "recurrenceRule", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', onCreate: () => new Date(), fieldName: 'created_at' }),
    __metadata("design:type", Date)
], TaskDefinitionOrmEntity.prototype, "createdAt", void 0);
exports.TaskDefinitionOrmEntity = TaskDefinitionOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'task_definitions' })
], TaskDefinitionOrmEntity);
//# sourceMappingURL=task-definition.orm-entity.js.map