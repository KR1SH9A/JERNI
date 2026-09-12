import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { LikeRepository } from '../../application/ports/like.repository';
import { Like } from '../../domain/like.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { LikeOrmEntity } from './like.orm-entity';

@Injectable()
export class MikroOrmLikeRepository implements LikeRepository {
  constructor(
    @InjectRepository(LikeOrmEntity)
    private readonly repo: EntityRepository<LikeOrmEntity>,
  ) {}

  async find(journeyId: JourneyId, userId: UserId): Promise<Like | null> {
    const orm = await this.repo.findOne({
      journeyId: journeyId.value,
      userId: userId.value,
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async save(like: Like): Promise<void> {
    const em = this.repo.getEntityManager();
    const orm = new LikeOrmEntity();
    orm.id = like.id;
    orm.journeyId = like.journeyId.value;
    orm.userId = like.userId.value;
    orm.likedAt = like.likedAt;
    em.persist(orm);
    await em.flush();
  }

  async delete(like: Like): Promise<void> {
    const em = this.repo.getEntityManager();
    const orm = await this.repo.findOne({ id: like.id });
    if (orm) {
      await em.removeAndFlush(orm);
    }
  }

  // ─── Mapping ─────────────────────────────────────────────────────────────

  private toDomain(orm: LikeOrmEntity): Like {
    return new Like({
      id: orm.id,
      journeyId: JourneyId.of(orm.journeyId),
      userId: UserId.of(orm.userId),
      likedAt: orm.likedAt,
    });
  }
}
