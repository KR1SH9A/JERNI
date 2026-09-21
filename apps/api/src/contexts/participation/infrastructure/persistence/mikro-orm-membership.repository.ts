import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { MembershipRepository } from '../../application/ports/membership.repository';
import { Membership } from '../../domain/membership.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { MembershipOrmEntity } from './membership.orm-entity';

@Injectable()
export class MikroOrmMembershipRepository implements MembershipRepository {
  constructor(
    @InjectRepository(MembershipOrmEntity)
    private readonly repo: EntityRepository<MembershipOrmEntity>,
  ) {}

  async findActive(journeyId: JourneyId, userId: UserId): Promise<Membership | null> {
    const orm = await this.repo.findOne({
      journeyId: journeyId.value,
      userId: userId.value,
      status: 'ACTIVE',
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findAllActiveByUserId(userId: UserId): Promise<Membership[]> {
    const orms = await this.repo.find(
      { userId: userId.value, status: 'ACTIVE' },
      { orderBy: { joinedAt: QueryOrder.DESC } },
    );
    return orms.map((o) => this.toDomain(o));
  }

  async save(membership: Membership): Promise<void> {
    const em = this.repo.getEntityManager();

    const existing = await this.repo.findOne({ id: membership.id });

    if (!existing) {
      const orm = new MembershipOrmEntity();
      orm.id = membership.id;
      orm.journeyId = membership.journeyId.value;
      orm.userId = membership.userId.value;
      orm.joinedAt = membership.joinedAt;
      orm.status = membership.status;
      em.persist(orm);
    } else {
      // Only status can change (ACTIVE → LEFT)
      existing.status = membership.status;
    }

    await em.flush();
  }

  // ─── Mapping ─────────────────────────────────────────────────────────────

  private toDomain(orm: MembershipOrmEntity): Membership {
    return new Membership({
      id: orm.id,
      journeyId: JourneyId.of(orm.journeyId),
      userId: UserId.of(orm.userId),
      joinedAt: orm.joinedAt,
      status: orm.status as 'ACTIVE' | 'LEFT',
    });
  }
}
