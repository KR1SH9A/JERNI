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
exports.AllTimeStatOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
let AllTimeStatOrmEntity = class AllTimeStatOrmEntity {
    journeyId;
    userId;
    displayName = '';
    milestonesCompleted = 0;
    recurringDoneToday = 0;
};
exports.AllTimeStatOrmEntity = AllTimeStatOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid', fieldName: 'journey_id' }),
    __metadata("design:type", String)
], AllTimeStatOrmEntity.prototype, "journeyId", void 0);
__decorate([
    (0, core_1.PrimaryKey)({ type: 'text', fieldName: 'user_id' }),
    __metadata("design:type", String)
], AllTimeStatOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', fieldName: 'display_name' }),
    __metadata("design:type", String)
], AllTimeStatOrmEntity.prototype, "displayName", void 0);
__decorate([
    (0, core_1.Property)({ type: 'integer', fieldName: 'milestones_completed' }),
    __metadata("design:type", Number)
], AllTimeStatOrmEntity.prototype, "milestonesCompleted", void 0);
__decorate([
    (0, core_1.Property)({ type: 'integer', fieldName: 'recurring_done_today' }),
    __metadata("design:type", Number)
], AllTimeStatOrmEntity.prototype, "recurringDoneToday", void 0);
exports.AllTimeStatOrmEntity = AllTimeStatOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'all_time_stats' })
], AllTimeStatOrmEntity);
//# sourceMappingURL=all-time-stat.orm-entity.js.map