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
exports.MikroOrmTaskCompletionRepository = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const task_completion_aggregate_1 = require("../../domain/task-completion.aggregate");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const task_completion_orm_entity_1 = require("./task-completion.orm-entity");
let MikroOrmTaskCompletionRepository = class MikroOrmTaskCompletionRepository {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findActive(journeyId, userId, taskDefinitionId, forDate) {
        const where = {
            journeyId: journeyId.value,
            userId: userId.value,
            taskDefinitionId,
            revokedAt: null, // active = not revoked
        };
        // Explicitly match null vs date — MikroORM handles both correctly
        where['forDate'] = forDate ?? null;
        const orm = await this.repo.findOne(where);
        if (!orm)
            return null;
        return this.toDomain(orm);
    }
    async findAllForUser(journeyId, userId) {
        const orms = await this.repo.find({
            journeyId: journeyId.value,
            userId: userId.value,
        });
        return orms.map((o) => this.toDomain(o));
    }
    async save(completion) {
        const em = this.repo.getEntityManager();
        const existing = await this.repo.findOne({ id: completion.id });
        if (!existing) {
            const orm = new task_completion_orm_entity_1.TaskCompletionOrmEntity();
            orm.id = completion.id;
            orm.journeyId = completion.journeyId.value;
            orm.userId = completion.userId.value;
            orm.taskDefinitionId = completion.taskDefinitionId;
            orm.taskKindSnapshot = completion.taskKindSnapshot;
            orm.forDate = completion.forDate;
            orm.completedAt = completion.completedAt;
            orm.revokedAt = completion.revokedAt;
            em.persist(orm);
        }
        else {
            // Only revokedAt changes (uncomplete)
            existing.revokedAt = completion.revokedAt;
        }
        await em.flush();
    }
    // ─── Mapping ─────────────────────────────────────────────────────────────
    toDomain(orm) {
        return task_completion_aggregate_1.TaskCompletion.reconstitute({
            id: orm.id,
            journeyId: journey_id_vo_1.JourneyId.of(orm.journeyId),
            userId: user_id_vo_1.UserId.of(orm.userId),
            taskDefinitionId: orm.taskDefinitionId,
            taskKindSnapshot: orm.taskKindSnapshot,
            forDate: orm.forDate,
            completedAt: orm.completedAt,
            revokedAt: orm.revokedAt,
        });
    }
};
exports.MikroOrmTaskCompletionRepository = MikroOrmTaskCompletionRepository;
exports.MikroOrmTaskCompletionRepository = MikroOrmTaskCompletionRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(task_completion_orm_entity_1.TaskCompletionOrmEntity)),
    __metadata("design:paramtypes", [core_1.EntityRepository])
], MikroOrmTaskCompletionRepository);
//# sourceMappingURL=mikro-orm-task-completion.repository.js.map