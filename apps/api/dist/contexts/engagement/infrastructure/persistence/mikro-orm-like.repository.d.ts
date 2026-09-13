import { EntityRepository } from '@mikro-orm/core';
import { LikeRepository } from '../../application/ports/like.repository';
import { Like } from '../../domain/like.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { LikeOrmEntity } from './like.orm-entity';
export declare class MikroOrmLikeRepository implements LikeRepository {
    private readonly repo;
    constructor(repo: EntityRepository<LikeOrmEntity>);
    find(journeyId: JourneyId, userId: UserId): Promise<Like | null>;
    save(like: Like): Promise<void>;
    delete(like: Like): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=mikro-orm-like.repository.d.ts.map