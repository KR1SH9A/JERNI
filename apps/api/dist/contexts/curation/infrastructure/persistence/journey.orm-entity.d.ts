import { Collection } from '@mikro-orm/core';
import { TaskDefinitionOrmEntity } from './task-definition.orm-entity';
export declare class JourneyOrmEntity {
    id: string;
    curatorId: string;
    title: string;
    description: string;
    tags: string[];
    visibility: string;
    status: string;
    coverProvider: string | null;
    coverAssetId: string | null;
    likeCount: number;
    createdAt: Date;
    updatedAt: Date;
    taskDefinitions: Collection<TaskDefinitionOrmEntity, object>;
}
//# sourceMappingURL=journey.orm-entity.d.ts.map