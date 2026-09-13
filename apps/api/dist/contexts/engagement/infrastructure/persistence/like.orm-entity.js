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
exports.LikeOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
let LikeOrmEntity = class LikeOrmEntity {
    id;
    journeyId;
    userId;
    likedAt = new Date();
};
exports.LikeOrmEntity = LikeOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], LikeOrmEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid', fieldName: 'journey_id' }),
    __metadata("design:type", String)
], LikeOrmEntity.prototype, "journeyId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', fieldName: 'user_id' }),
    __metadata("design:type", String)
], LikeOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', fieldName: 'liked_at' }),
    __metadata("design:type", Date)
], LikeOrmEntity.prototype, "likedAt", void 0);
exports.LikeOrmEntity = LikeOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'likes' })
], LikeOrmEntity);
//# sourceMappingURL=like.orm-entity.js.map