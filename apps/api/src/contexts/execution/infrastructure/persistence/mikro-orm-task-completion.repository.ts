import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { TaskCompletionRepository } from '../../application/ports/task-completion.repository';
import { TaskCompletion } from '../../domain/task-completion.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { TaskCompletionOrmEntity } from './task-completion.orm-entity';

@Injectable()
export class MikroOrmTaskCompletionRepository implements TaskCompletionRepository {
  constructor(
    @InjectRepository(TaskCompletionOrmEntity)
    private readonly repo: EntityRepository<TaskCompletionOrmEntity>,
  ) {}

  async findActive(
    journeyId: JourneyId,
    userId: UserId,
    taskDefinitionId: string,
    forDate: string | null,
  ): Promise<TaskCompletion | null> {
    const where: Record<string, unknown> = {
      journeyId: journeyId.value,
      userId: userId.value,
      taskDefinitionId,
      revokedAt: null, // active = not revoked
    };
    // Explicitly match null vs date — MikroORM handles both correctly
    where['forDate'] = forDate ?? null;

    const orm = await this.repo.findOne(where);
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findAllForUser(journeyId: JourneyId, userId: UserId): Promise<TaskCompletion[]> {
    const orms = await this.repo.find({
      journeyId: journeyId.value,
      userId: userId.value,
    });
    return orms.map((o) => this.toDomain(o));
  }

  async save(completion: TaskCompletion): Promise<void> {
    const em = this.repo.getEntityManager();

    const existing = await this.repo.findOne({ id: completion.id });

    if (!existing) {
      const orm = new TaskCompletionOrmEntity();
      orm.id = completion.id;
      orm.journeyId = completion.journeyId.value;
      orm.userId = completion.userId.value;
      orm.taskDefinitionId = completion.taskDefinitionId;
      orm.taskKindSnapshot = completion.taskKindSnapshot;
      orm.forDate = completion.forDate;
      orm.completedAt = completion.completedAt;
      orm.revokedAt = completion.revokedAt;
      em.persist(orm);
    } else {
      // Only revokedAt changes (uncomplete)
      existing.revokedAt = completion.revokedAt;
    }

    await em.flush();
  }

  // ─── Mapping ─────────────────────────────────────────────────────────────

  private toDomain(orm: TaskCompletionOrmEntity): TaskCompletion {
    return TaskCompletion.reconstitute({
      id: orm.id,
      journeyId: JourneyId.of(orm.journeyId),
      userId: UserId.of(orm.userId),
      taskDefinitionId: orm.taskDefinitionId,
      taskKindSnapshot: orm.taskKindSnapshot as 'MILESTONE' | 'RECURRING',
      forDate: orm.forDate,
      completedAt: orm.completedAt,
      revokedAt: orm.revokedAt,
    });
  }
}
