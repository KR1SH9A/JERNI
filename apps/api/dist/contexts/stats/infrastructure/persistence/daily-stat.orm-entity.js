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
exports.DailyStatOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
let DailyStatOrmEntity = class DailyStatOrmEntity {
    journeyId;
    userId;
    taskDefinitionId;
    forDate;
    completedCount = 0;
};
exports.DailyStatOrmEntity = DailyStatOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid', fieldName: 'journey_id' }),
    __metadata("design:type", String)
], DailyStatOrmEntity.prototype, "journeyId", void 0);
__decorate([
    (0, core_1.PrimaryKey)({ type: 'text', fieldName: 'user_id' }),
    __metadata("design:type", String)
], DailyStatOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid', fieldName: 'task_definition_id' }),
    __metadata("design:type", String)
], DailyStatOrmEntity.prototype, "taskDefinitionId", void 0);
__decorate([
    (0, core_1.PrimaryKey)({ type: 'date', fieldName: 'for_date' }),
    __metadata("design:type", String)
], DailyStatOrmEntity.prototype, "forDate", void 0);
__decorate([
    (0, core_1.Property)({ type: 'smallint', fieldName: 'completed_count' }),
    __metadata("design:type", Number)
], DailyStatOrmEntity.prototype, "completedCount", void 0);
exports.DailyStatOrmEntity = DailyStatOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'daily_stats' })
], DailyStatOrmEntity);
//# sourceMappingURL=daily-stat.orm-entity.js.map