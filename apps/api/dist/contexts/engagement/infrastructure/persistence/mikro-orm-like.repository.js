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
exports.MikroOrmLikeRepository = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const like_aggregate_1 = require("../../domain/like.aggregate");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const like_orm_entity_1 = require("./like.orm-entity");
let MikroOrmLikeRepository = class MikroOrmLikeRepository {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async find(journeyId, userId) {
        const orm = await this.repo.findOne({
            journeyId: journeyId.value,
            userId: userId.value,
        });
        if (!orm)
            return null;
        return this.toDomain(orm);
    }
    async save(like) {
        const em = this.repo.getEntityManager();
        const orm = new like_orm_entity_1.LikeOrmEntity();
        orm.id = like.id;
        orm.journeyId = like.journeyId.value;
        orm.userId = like.userId.value;
        orm.likedAt = like.likedAt;
        em.persist(orm);
        await em.flush();
    }
    async delete(like) {
        const em = this.repo.getEntityManager();
        const orm = await this.repo.findOne({ id: like.id });
        if (orm) {
            await em.removeAndFlush(orm);
        }
    }
    // ─── Mapping ─────────────────────────────────────────────────────────────
    toDomain(orm) {
        return new like_aggregate_1.Like({
            id: orm.id,
            journeyId: journey_id_vo_1.JourneyId.of(orm.journeyId),
            userId: user_id_vo_1.UserId.of(orm.userId),
            likedAt: orm.likedAt,
        });
    }
};
exports.MikroOrmLikeRepository = MikroOrmLikeRepository;
exports.MikroOrmLikeRepository = MikroOrmLikeRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(like_orm_entity_1.LikeOrmEntity)),
    __metadata("design:paramtypes", [core_1.EntityRepository])
], MikroOrmLikeRepository);
//# sourceMappingURL=mikro-orm-like.repository.js.map