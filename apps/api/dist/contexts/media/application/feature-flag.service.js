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
exports.FeatureFlagService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const feature_flag_orm_entity_1 = require("../infrastructure/persistence/feature-flag.orm-entity");
let FeatureFlagService = class FeatureFlagService {
    repo;
    cache = new Map();
    TTL_MS = 30_000; // 30 seconds
    constructor(repo) {
        this.repo = repo;
    }
    async isEnabled(key) {
        const flag = await this.get(key);
        return flag?.enabled ?? false;
    }
    async getConfig(key) {
        const flag = await this.get(key);
        return flag?.config ?? {};
    }
    async set(key, enabled, config) {
        const em = this.repo.getEntityManager();
        let flag = await this.repo.findOne({ key });
        if (!flag) {
            flag = em.create(feature_flag_orm_entity_1.FeatureFlagOrmEntity, { key, enabled, config: config ?? {}, updatedAt: new Date() });
            em.persist(flag);
        }
        else {
            flag.enabled = enabled;
            if (config !== undefined)
                flag.config = config;
            flag.updatedAt = new Date();
        }
        await em.flush();
        // Invalidate cache on write
        this.cache.delete(key);
    }
    async get(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.value;
        }
        const flag = await this.repo.findOne({ key });
        if (!flag)
            return null;
        const value = { enabled: flag.enabled, config: flag.config };
        this.cache.set(key, { value, expiresAt: Date.now() + this.TTL_MS });
        return value;
    }
};
exports.FeatureFlagService = FeatureFlagService;
exports.FeatureFlagService = FeatureFlagService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(feature_flag_orm_entity_1.FeatureFlagOrmEntity)),
    __metadata("design:paramtypes", [core_1.EntityRepository])
], FeatureFlagService);
//# sourceMappingURL=feature-flag.service.js.map