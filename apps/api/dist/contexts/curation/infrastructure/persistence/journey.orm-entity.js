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
exports.JourneyOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
const task_definition_orm_entity_1 = require("./task-definition.orm-entity");
let JourneyOrmEntity = class JourneyOrmEntity {
    id;
    curatorId;
    title;
    description = '';
    tags = [];
    visibility = 'PUBLIC';
    status = 'DRAFT';
    coverProvider = null;
    coverAssetId = null;
    likeCount = 0;
    createdAt = new Date();
    updatedAt = new Date();
    taskDefinitions = new core_1.Collection(this);
};
exports.JourneyOrmEntity = JourneyOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], JourneyOrmEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', fieldName: 'curator_id' }),
    __metadata("design:type", String)
], JourneyOrmEntity.prototype, "curatorId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], JourneyOrmEntity.prototype, "title", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], JourneyOrmEntity.prototype, "description", void 0);
__decorate([
    (0, core_1.Property)({ type: 'array', fieldName: 'tags' }),
    __metadata("design:type", Array)
], JourneyOrmEntity.prototype, "tags", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], JourneyOrmEntity.prototype, "visibility", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], JourneyOrmEntity.prototype, "status", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', nullable: true, fieldName: 'cover_provider' }),
    __metadata("design:type", Object)
], JourneyOrmEntity.prototype, "coverProvider", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', nullable: true, fieldName: 'cover_asset_id' }),
    __metadata("design:type", Object)
], JourneyOrmEntity.prototype, "coverAssetId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'integer', fieldName: 'like_count' }),
    __metadata("design:type", Number)
], JourneyOrmEntity.prototype, "likeCount", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', onCreate: () => new Date(), fieldName: 'created_at' }),
    __metadata("design:type", Date)
], JourneyOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', onUpdate: () => new Date(), fieldName: 'updated_at' }),
    __metadata("design:type", Date)
], JourneyOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, core_1.OneToMany)(() => task_definition_orm_entity_1.TaskDefinitionOrmEntity, (t) => t.journey, { eager: true }),
    __metadata("design:type", Object)
], JourneyOrmEntity.prototype, "taskDefinitions", void 0);
exports.JourneyOrmEntity = JourneyOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'journeys' })
], JourneyOrmEntity);
//# sourceMappingURL=journey.orm-entity.js.map