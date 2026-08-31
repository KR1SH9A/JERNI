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
exports.MikroOrmUserProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const user_profile_entity_1 = require("../../domain/user-profile.entity");
const user_profile_orm_entity_1 = require("./user-profile.orm-entity");
/**
 * MikroORM implementation of UserProfileRepository.
 *
 * Maps between the domain entity (pure class) and the ORM entity (decorated).
 * All other code depends on the UserProfileRepository interface — never this class.
 */
let MikroOrmUserProfileRepository = class MikroOrmUserProfileRepository {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findById(id) {
        const orm = await this.repo.findOne({ id });
        if (!orm)
            return null;
        return this.toDomain(orm);
    }
    async save(profile) {
        const existing = await this.repo.findOne({ id: profile.id });
        if (existing) {
            existing.displayName = profile.displayName;
            existing.avatarProvider = profile.avatarProvider;
            existing.avatarAssetId = profile.avatarAssetId;
            existing.updatedAt = profile.updatedAt;
        }
        else {
            const orm = this.repo.create({
                id: profile.id,
                displayName: profile.displayName,
                avatarProvider: profile.avatarProvider,
                avatarAssetId: profile.avatarAssetId,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
            });
            this.repo.getEntityManager().persist(orm);
        }
        await this.repo.getEntityManager().flush();
    }
    toDomain(orm) {
        return new user_profile_entity_1.UserProfile({
            id: orm.id,
            displayName: orm.displayName,
            avatarProvider: orm.avatarProvider,
            avatarAssetId: orm.avatarAssetId,
            createdAt: orm.createdAt,
            updatedAt: orm.updatedAt,
        });
    }
};
exports.MikroOrmUserProfileRepository = MikroOrmUserProfileRepository;
exports.MikroOrmUserProfileRepository = MikroOrmUserProfileRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(user_profile_orm_entity_1.UserProfileOrmEntity)),
    __metadata("design:paramtypes", [core_1.EntityRepository])
], MikroOrmUserProfileRepository);
//# sourceMappingURL=mikro-orm-user-profile.repository.js.map