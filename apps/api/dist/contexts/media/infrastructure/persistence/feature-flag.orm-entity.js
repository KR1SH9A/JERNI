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
exports.FeatureFlagOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
let FeatureFlagOrmEntity = class FeatureFlagOrmEntity {
    key;
    enabled = false;
    config = {};
    updatedAt = new Date();
};
exports.FeatureFlagOrmEntity = FeatureFlagOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'text' }),
    __metadata("design:type", String)
], FeatureFlagOrmEntity.prototype, "key", void 0);
__decorate([
    (0, core_1.Property)({ type: 'boolean' }),
    __metadata("design:type", Boolean)
], FeatureFlagOrmEntity.prototype, "enabled", void 0);
__decorate([
    (0, core_1.Property)({ type: 'json' }),
    __metadata("design:type", Object)
], FeatureFlagOrmEntity.prototype, "config", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', onUpdate: () => new Date(), fieldName: 'updated_at' }),
    __metadata("design:type", Date)
], FeatureFlagOrmEntity.prototype, "updatedAt", void 0);
exports.FeatureFlagOrmEntity = FeatureFlagOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'feature_flags' })
], FeatureFlagOrmEntity);
//# sourceMappingURL=feature-flag.orm-entity.js.map