import { JourneyId } from '../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../shared-kernel/value-objects/user-id.vo';
import { TaskDefinition } from './task-definition.entity';
export type JourneyVisibility = 'PUBLIC' | 'PRIVATE';
export type JourneyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
/**
 * Journey — Aggregate Root for the Curation bounded context.
 *
 * All state changes go through methods on this class.
 * Invariants are enforced HERE, not in application services or controllers.
 */
export declare class Journey {
    readonly id: JourneyId;
    readonly curatorId: UserId;
    title: string;
    description: string;
    tags: string[];
    visibility: JourneyVisibility;
    status: JourneyStatus;
    coverProvider: string | null;
    coverAssetId: string | null;
    likeCount: number;
    readonly createdAt: Date;
    updatedAt: Date;
    private _taskDefinitions;
    constructor(props: {
        id: JourneyId;
        curatorId: UserId;
        title: string;
        description?: string;
        tags?: string[];
        visibility?: JourneyVisibility;
        status?: JourneyStatus;
        coverProvider?: string | null;
        coverAssetId?: string | null;
        likeCount?: number;
        createdAt?: Date;
        updatedAt?: Date;
        taskDefinitions?: TaskDefinition[];
    });
    get taskDefinitions(): ReadonlyArray<TaskDefinition>;
    /**
     * Publish a DRAFT journey.
     * Invariant: cannot publish if it has no tasks.
     */
    publish(): void;
    /**
     * Archive a PUBLISHED journey.
     */
    archive(): void;
    /**
     * Add a task definition.
     *
     * Invariants:
     *  - A DRAFT journey can have tasks added freely.
     *  - A PUBLISHED journey only accepts ADDITIVE additions (no edits/removals).
     *    The caller must pass the next orderIndex — we enforce uniqueness here.
     *  - An ARCHIVED journey cannot receive new tasks.
     */
    addTask(task: TaskDefinition): void;
    /**
     * Guard used by the Participation context before allowing a join.
     */
    canBeJoined(): boolean;
    /**
     * Returns true only if the given userId is the curator.
     */
    isCurator(userId: UserId): boolean;
    /**
     * Increment the denormalized like count (driven by a domain event handler).
     * Only the event handler calls this — controllers never mutate this directly.
     */
    incrementLikeCount(): void;
    decrementLikeCount(): void;
}
//# sourceMappingURL=journey.aggregate.d.ts.map