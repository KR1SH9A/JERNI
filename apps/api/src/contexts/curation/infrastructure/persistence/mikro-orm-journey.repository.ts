import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import {
  JourneyRepository,
  JourneyFilters,
  PaginatedResult,
} from '../../application/ports/journey.repository';
import { Journey } from '../../domain/journey.aggregate';
import { TaskDefinition } from '../../domain/task-definition.entity';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { JourneyOrmEntity } from './journey.orm-entity';
import { TaskDefinitionOrmEntity } from './task-definition.orm-entity';

@Injectable()
export class MikroOrmJourneyRepository implements JourneyRepository {
  constructor(
    @InjectRepository(JourneyOrmEntity)
    private readonly repo: EntityRepository<JourneyOrmEntity>,
    @InjectRepository(TaskDefinitionOrmEntity)
    private readonly taskRepo: EntityRepository<TaskDefinitionOrmEntity>,
  ) {}

  async findById(id: JourneyId): Promise<Journey | null> {
    const orm = await this.repo.findOne(
      { id: id.value },
      { populate: ['taskDefinitions'] },
    );
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findPublicPublished(
    filters: JourneyFilters,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<Journey>> {
    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (filters.curatorId) where['curatorId'] = filters.curatorId;
    if (filters.tags?.length) {
      // Normalise: NestJS may deliver a single ?tags=foo as a bare string
      // when only one value is provided (no ParseArrayPipe).
      const tagsArray = Array.isArray(filters.tags)
        ? filters.tags
        : [filters.tags as unknown as string];

      // ArrayType (native PG text[]) makes $contains emit: tags @> '{"tag"}'
      where['tags'] = { $contains: tagsArray };
    }

    const offset = (page - 1) * pageSize;
    const [orms, total] = await this.repo.findAndCount(where, {
      populate: ['taskDefinitions'],
      orderBy: { createdAt: QueryOrder.DESC },
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

  async save(journey: Journey): Promise<void> {
    const em = this.repo.getEntityManager();

    const existing = await this.repo.findOne(
      { id: journey.id.value },
      { populate: ['taskDefinitions'] },
    );

    if (!existing) {
      // New journey — create fresh ORM entity
      const orm = new JourneyOrmEntity();
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
        const taskOrm = new TaskDefinitionOrmEntity();
        taskOrm.id = task.id;
        taskOrm.journey = orm;
        taskOrm.title = task.title;
        taskOrm.orderIndex = task.orderIndex;
        taskOrm.kind = task.kind;
        taskOrm.recurrenceRule = task.recurrenceRule;
        taskOrm.createdAt = task.createdAt;
        em.persist(taskOrm);
      }
    } else {
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
      const existingTaskIds = new Set(
        existing.taskDefinitions.isInitialized()
          ? existing.taskDefinitions.getItems().map((t) => t.id)
          : [],
      );

      for (const task of journey.taskDefinitions) {
        if (!existingTaskIds.has(task.id)) {
          const taskOrm = new TaskDefinitionOrmEntity();
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

  async findByCuratorId(
    curatorId: string,
  ): Promise<{ journey: Journey; memberCount: number }[]> {
    const em = this.repo.getEntityManager();

    // Load all journeys for this curator (all statuses)
    const orms = await this.repo.find(
      { curatorId },
      {
        populate: ['taskDefinitions'],
        orderBy: { createdAt: QueryOrder.DESC },
      },
    );

    if (orms.length === 0) return [];

    // Live member count — one raw query for all journey IDs at once
    const journeyIds = orms.map((o) => o.id);
    const countRows = await em.getConnection().execute<
      { journey_id: string; member_count: string }[]
    >(
      `
      SELECT journey_id, COUNT(*) AS member_count
      FROM memberships
      WHERE journey_id = ANY(?) AND status = 'ACTIVE'
      GROUP BY journey_id
      `,
      [journeyIds],
    );

    const countMap = new Map<string, number>(
      countRows.map((r: { journey_id: string; member_count: string }) =>
        [r.journey_id, parseInt(r.member_count, 10)] as [string, number],
      ),
    );

    return orms.map((orm) => ({
      journey: this.toDomain(orm),
      memberCount: countMap.get(orm.id) ?? 0,
    }));
  }

  async nextOrderIndex(journeyId: JourneyId): Promise<number> {
    const tasks = await this.taskRepo.find(
      { journey: { id: journeyId.value } },
      { orderBy: { orderIndex: QueryOrder.DESC }, limit: 1 },
    );
    return tasks.length > 0 ? tasks[0].orderIndex + 1 : 0;
  }

  // ─── Mapping ─────────────────────────────────────────────────────────────

  private toDomain(orm: JourneyOrmEntity): Journey {
    const tasks = orm.taskDefinitions.isInitialized()
      ? orm.taskDefinitions.getItems().map(
          (t) =>
            new TaskDefinition({
              id: t.id,
              journeyId: orm.id,
              title: t.title,
              orderIndex: t.orderIndex,
              kind: t.kind as 'MILESTONE' | 'RECURRING',
              recurrenceRule: t.recurrenceRule as 'DAILY' | null,
              createdAt: t.createdAt,
            }),
        )
      : [];

    return new Journey({
      id: JourneyId.of(orm.id),
      curatorId: UserId.of(orm.curatorId),
      title: orm.title,
      description: orm.description,
      tags: orm.tags,
      visibility: orm.visibility as 'PUBLIC' | 'PRIVATE',
      status: orm.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      coverProvider: orm.coverProvider,
      coverAssetId: orm.coverAssetId,
      likeCount: orm.likeCount,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      taskDefinitions: tasks,
    });
  }
}
