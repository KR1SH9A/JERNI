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
exports.MikroOrmJourneyRepository = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const journey_aggregate_1 = require("../../domain/journey.aggregate");
const task_definition_entity_1 = require("../../domain/task-definition.entity");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const journey_orm_entity_1 = require("./journey.orm-entity");
const task_definition_orm_entity_1 = require("./task-definition.orm-entity");
let MikroOrmJourneyRepository = class MikroOrmJourneyRepository {
    repo;
    taskRepo;
    constructor(repo, taskRepo) {
        this.repo = repo;
        this.taskRepo = taskRepo;
    }
    async findById(id) {
        const orm = await this.repo.findOne({ id: id.value }, { populate: ['taskDefinitions'] });
        if (!orm)
            return null;
        return this.toDomain(orm);
    }
    async findPublicPublished(filters, page, pageSize) {
        const where = {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
        };
        if (filters.curatorId)
            where['curatorId'] = filters.curatorId;
        if (filters.tags?.length)
            where['tags'] = { $contains: filters.tags };
        const offset = (page - 1) * pageSize;
        const [orms, total] = await this.repo.findAndCount(where, {
            populate: ['taskDefinitions'],
            orderBy: { createdAt: core_1.QueryOrder.DESC },
            limit: pageSize,
            offset,
        });
        return {
            data: orms.map((o) => this.toDomain(o)),
            total,
            page,
            pageSize,
        };
    }
    async save(journey) {
        const em = this.repo.getEntityManager();
        const existing = await this.repo.findOne({ id: journey.id.value }, { populate: ['taskDefinitions'] });
        if (!existing) {
            // New journey — create fresh ORM entity
            const orm = new journey_orm_entity_1.JourneyOrmEntity();
            orm.id = journey.id.value;
            orm.curatorId = journey.curatorId.value;
            orm.title = journey.title;
            orm.description = journey.description;
            orm.tags = journey.tags;
            orm.visibility = journey.visibility;
            orm.status = journey.status;
            orm.coverProvider = journey.coverProvider;
            orm.coverAssetId = journey.coverAssetId;
            orm.likeCount = journey.likeCount;
            orm.createdAt = journey.createdAt;
            orm.updatedAt = journey.updatedAt;
            em.persist(orm);
            // Persist tasks for the new journey
            for (const task of journey.taskDefinitions) {
                const taskOrm = new task_definition_orm_entity_1.TaskDefinitionOrmEntity();
                taskOrm.id = task.id;
                taskOrm.journey = orm;
                taskOrm.title = task.title;
                taskOrm.orderIndex = task.orderIndex;
                taskOrm.kind = task.kind;
                taskOrm.recurrenceRule = task.recurrenceRule;
                taskOrm.createdAt = task.createdAt;
                em.persist(taskOrm);
            }
        }
        else {
            // Existing journey — update scalar fields
            existing.title = journey.title;
            existing.description = journey.description;
            existing.tags = journey.tags;
            existing.visibility = journey.visibility;
            existing.status = journey.status;
            existing.coverProvider = journey.coverProvider;
            existing.coverAssetId = journey.coverAssetId;
            existing.likeCount = journey.likeCount;
            existing.updatedAt = journey.updatedAt;
            // Sync tasks — additive only (never delete existing tasks)
            const existingTaskIds = new Set(existing.taskDefinitions.isInitialized()
                ? existing.taskDefinitions.getItems().map((t) => t.id)
                : []);
            for (const task of journey.taskDefinitions) {
                if (!existingTaskIds.has(task.id)) {
                    const taskOrm = new task_definition_orm_entity_1.TaskDefinitionOrmEntity();
                    taskOrm.id = task.id;
                    taskOrm.journey = existing;
                    taskOrm.title = task.title;
                    taskOrm.orderIndex = task.orderIndex;
                    taskOrm.kind = task.kind;
                    taskOrm.recurrenceRule = task.recurrenceRule;
                    taskOrm.createdAt = task.createdAt;
                    em.persist(taskOrm);
                }
            }
        }
        await em.flush();
    }
    async findByCuratorId(curatorId) {
        const em = this.repo.getEntityManager();
        // Load all journeys for this curator (all statuses)
        const orms = await this.repo.find({ curatorId }, {
            populate: ['taskDefinitions'],
            orderBy: { createdAt: core_1.QueryOrder.DESC },
        });
        if (orms.length === 0)
            return [];
        // Live member count — one raw query for all journey IDs at once
        const journeyIds = orms.map((o) => o.id);
        const countRows = await em.getConnection().execute(`
      SELECT journey_id, COUNT(*) AS member_count
      FROM memberships
      WHERE journey_id = ANY(?) AND status = 'ACTIVE'
      GROUP BY journey_id
      `, [journeyIds]);
        const countMap = new Map(countRows.map((r) => [r.journey_id, parseInt(r.member_count, 10)]));
        return orms.map((orm) => ({
            journey: this.toDomain(orm),
            memberCount: countMap.get(orm.id) ?? 0,
        }));
    }
    async nextOrderIndex(journeyId) {
        const tasks = await this.taskRepo.find({ journey: { id: journeyId.value } }, { orderBy: { orderIndex: core_1.QueryOrder.DESC }, limit: 1 });
        return tasks.length > 0 ? tasks[0].orderIndex + 1 : 0;
    }
    // ─── Mapping ─────────────────────────────────────────────────────────────
    toDomain(orm) {
        const tasks = orm.taskDefinitions.isInitialized()
            ? orm.taskDefinitions.getItems().map((t) => new task_definition_entity_1.TaskDefinition({
                id: t.id,
                journeyId: orm.id,
                title: t.title,
                orderIndex: t.orderIndex,
                kind: t.kind,
                recurrenceRule: t.recurrenceRule,
                createdAt: t.createdAt,
            }))
            : [];
        return new journey_aggregate_1.Journey({
            id: journey_id_vo_1.JourneyId.of(orm.id),
            curatorId: user_id_vo_1.UserId.of(orm.curatorId),
            title: orm.title,
            description: orm.description,
            tags: orm.tags,
            visibility: orm.visibility,
            status: orm.status,
            coverProvider: orm.coverProvider,
            coverAssetId: orm.coverAssetId,
            likeCount: orm.likeCount,
            createdAt: orm.createdAt,
            updatedAt: orm.updatedAt,
            taskDefinitions: tasks,
        });
    }
};
exports.MikroOrmJourneyRepository = MikroOrmJourneyRepository;
exports.MikroOrmJourneyRepository = MikroOrmJourneyRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(journey_orm_entity_1.JourneyOrmEntity)),
    __param(1, (0, nestjs_1.InjectRepository)(task_definition_orm_entity_1.TaskDefinitionOrmEntity)),
    __metadata("design:paramtypes", [core_1.EntityRepository,
        core_1.EntityRepository])
], MikroOrmJourneyRepository);
//# sourceMappingURL=mikro-orm-journey.repository.js.map