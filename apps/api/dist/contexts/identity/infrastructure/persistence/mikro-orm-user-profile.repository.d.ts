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
export declare class MikroOrmUserProfileRepository implements UserProfileRepository {
    private readonly repo;
    constructor(repo: EntityRepository<UserProfileOrmEntity>);
    findById(id: string): Promise<UserProfile | null>;
    save(profile: UserProfile): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=mikro-orm-user-profile.repository.d.ts.map