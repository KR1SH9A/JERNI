import { EntityRepository } from '@mikro-orm/core';
import { JourneyRepository, JourneyFilters, PaginatedResult } from '../../application/ports/journey.repository';
import { Journey } from '../../domain/journey.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { JourneyOrmEntity } from './journey.orm-entity';
import { TaskDefinitionOrmEntity } from './task-definition.orm-entity';
export declare class MikroOrmJourneyRepository implements JourneyRepository {
    private readonly repo;
    private readonly taskRepo;
    constructor(repo: EntityRepository<JourneyOrmEntity>, taskRepo: EntityRepository<TaskDefinitionOrmEntity>);
    findById(id: JourneyId): Promise<Journey | null>;
    findPublicPublished(filters: JourneyFilters, page: number, pageSize: number): Promise<PaginatedResult<Journey>>;
    save(journey: Journey): Promise<void>;
    nextOrderIndex(journeyId: JourneyId): Promise<number>;
    private toDomain;
}
//# sourceMappingURL=mikro-orm-journey.repository.d.ts.map