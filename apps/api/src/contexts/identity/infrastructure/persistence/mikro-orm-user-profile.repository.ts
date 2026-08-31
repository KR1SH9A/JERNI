import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserProfile } from '../../domain/user-profile.entity';
import { UserProfileRepository } from '../../application/ports/user-profile.repository';
import { UserProfileOrmEntity } from './user-profile.orm-entity';

/**
 * MikroORM implementation of UserProfileRepository.
 *
 * Maps between the domain entity (pure class) and the ORM entity (decorated).
 * All other code depends on the UserProfileRepository interface — never this class.
 */
@Injectable()
export class MikroOrmUserProfileRepository implements UserProfileRepository {
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repo: EntityRepository<UserProfileOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserProfile | null> {
    const orm = await this.repo.findOne({ id });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async save(profile: UserProfile): Promise<void> {
    const existing = await this.repo.findOne({ id: profile.id });

    if (existing) {
      existing.displayName = profile.displayName;
      existing.avatarProvider = profile.avatarProvider;
      existing.avatarAssetId = profile.avatarAssetId;
      existing.updatedAt = profile.updatedAt;
    } else {
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

  private toDomain(orm: UserProfileOrmEntity): UserProfile {
    return new UserProfile({
      id: orm.id,
      displayName: orm.displayName,
      avatarProvider: orm.avatarProvider,
      avatarAssetId: orm.avatarAssetId,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }
}
