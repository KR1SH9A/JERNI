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
exports.UserProfileOrmEntity = void 0;
const core_1 = require("@mikro-orm/core");
/**
 * MikroORM entity mapping for the `user_profiles` table.
 *
 * Note: this lives in the Infrastructure layer — domain code (UserProfile entity)
 * never imports this class. The repository adapter maps between them.
 */
let UserProfileOrmEntity = class UserProfileOrmEntity {
    id;
    displayName;
    avatarProvider = null;
    avatarAssetId = null;
    createdAt = new Date();
    updatedAt = new Date();
};
exports.UserProfileOrmEntity = UserProfileOrmEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'text' }),
    __metadata("design:type", String)
], UserProfileOrmEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', fieldName: 'display_name' }),
    __metadata("design:type", String)
], UserProfileOrmEntity.prototype, "displayName", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', nullable: true, fieldName: 'avatar_provider' }),
    __metadata("design:type", Object)
], UserProfileOrmEntity.prototype, "avatarProvider", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text', nullable: true, fieldName: 'avatar_asset_id' }),
    __metadata("design:type", Object)
], UserProfileOrmEntity.prototype, "avatarAssetId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', onCreate: () => new Date(), fieldName: 'created_at' }),
    __metadata("design:type", Date)
], UserProfileOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', onUpdate: () => new Date(), fieldName: 'updated_at' }),
    __metadata("design:type", Date)
], UserProfileOrmEntity.prototype, "updatedAt", void 0);
exports.UserProfileOrmEntity = UserProfileOrmEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'user_profiles' })
], UserProfileOrmEntity);
//# sourceMappingURL=user-profile.orm-entity.js.map