import { JourneyOrmEntity } from './journey.orm-entity';
export declare class TaskDefinitionOrmEntity {
    id: string;
    journey: JourneyOrmEntity;
    title: string;
    orderIndex: number;
    kind: string;
    recurrenceRule: string | null;
    createdAt: Date;
}
//# sourceMappingURL=task-definition.orm-entity.d.ts.map