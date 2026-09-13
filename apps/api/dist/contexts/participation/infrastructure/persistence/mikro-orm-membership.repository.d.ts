import { EntityRepository } from '@mikro-orm/core';
import { MembershipRepository } from '../../application/ports/membership.repository';
import { Membership } from '../../domain/membership.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { MembershipOrmEntity } from './membership.orm-entity';
export declare class MikroOrmMembershipRepository implements MembershipRepository {
    private readonly repo;
    constructor(repo: EntityRepository<MembershipOrmEntity>);
    findActive(journeyId: JourneyId, userId: UserId): Promise<Membership | null>;
    save(membership: Membership): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=mikro-orm-membership.repository.d.ts.map