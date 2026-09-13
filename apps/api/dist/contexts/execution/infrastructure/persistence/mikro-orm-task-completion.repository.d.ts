import { EntityRepository } from '@mikro-orm/core';
import { TaskCompletionRepository } from '../../application/ports/task-completion.repository';
import { TaskCompletion } from '../../domain/task-completion.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { TaskCompletionOrmEntity } from './task-completion.orm-entity';
export declare class MikroOrmTaskCompletionRepository implements TaskCompletionRepository {
    private readonly repo;
    constructor(repo: EntityRepository<TaskCompletionOrmEntity>);
    findActive(journeyId: JourneyId, userId: UserId, taskDefinitionId: string, forDate: string | null): Promise<TaskCompletion | null>;
    findAllForUser(journeyId: JourneyId, userId: UserId): Promise<TaskCompletion[]>;
    save(completion: TaskCompletion): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=mikro-orm-task-completion.repository.d.ts.map