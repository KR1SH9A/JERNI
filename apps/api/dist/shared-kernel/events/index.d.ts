import { IEvent } from '@nestjs/cqrs';
export declare class MemberJoinedEvent implements IEvent {
    readonly journeyId: string;
    readonly userId: string;
    readonly joinedAt: Date;
    constructor(journeyId: string, userId: string, joinedAt: Date);
}
export declare class MemberLeftEvent implements IEvent {
    readonly journeyId: string;
    readonly userId: string;
    constructor(journeyId: string, userId: string);
}
export declare class TaskCompletedEvent implements IEvent {
    readonly journeyId: string;
    readonly userId: string;
    readonly taskDefinitionId: string;
    readonly taskKind: 'MILESTONE' | 'RECURRING';
    readonly forDate: string | null;
    constructor(journeyId: string, userId: string, taskDefinitionId: string, taskKind: 'MILESTONE' | 'RECURRING', forDate: string | null);
}
export declare class TaskUncompletedEvent implements IEvent {
    readonly journeyId: string;
    readonly userId: string;
    readonly taskDefinitionId: string;
    readonly forDate: string | null;
    constructor(journeyId: string, userId: string, taskDefinitionId: string, forDate: string | null);
}
export declare class JourneyLikedEvent implements IEvent {
    readonly journeyId: string;
    readonly userId: string;
    constructor(journeyId: string, userId: string);
}
export declare class JourneyUnlikedEvent implements IEvent {
    readonly journeyId: string;
    readonly userId: string;
    constructor(journeyId: string, userId: string);
}
//# sourceMappingURL=index.d.ts.map