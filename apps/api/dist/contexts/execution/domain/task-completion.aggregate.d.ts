import { JourneyId } from '../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../shared-kernel/value-objects/user-id.vo';
export type TaskKindSnapshot = 'MILESTONE' | 'RECURRING';
/**
 * TaskCompletion — Aggregate Root for the Execution bounded context.
 *
 * The key design decision: `forDate` is null for MILESTONE tasks and an ISO
 * date string ('YYYY-MM-DD') for RECURRING tasks. Combined with the DB unique
 * constraint `UNIQUE NULLS NOT DISTINCT (journey_id, user_id, task_definition_id, for_date)`,
 * this single column encodes both uniqueness semantics:
 *
 *   MILESTONE:  forDate = NULL  → unique once, forever
 *   RECURRING:  forDate = date  → unique per calendar day, resets daily
 *
 * `taskKindSnapshot` is copied from the live TaskDefinition at completion time
 * (not looked up live). If a curator ever could change a task's kind (they can't
 * by Curation's invariants), existing completions would still reflect what the
 * task WAS when completed — preserving audit integrity.
 */
export declare class TaskCompletion {
    readonly id: string;
    readonly journeyId: JourneyId;
    readonly userId: UserId;
    readonly taskDefinitionId: string;
    readonly taskKindSnapshot: TaskKindSnapshot;
    /** ISO date string 'YYYY-MM-DD' for RECURRING; null for MILESTONE */
    readonly forDate: string | null;
    readonly completedAt: Date;
    revokedAt: Date | null;
    private constructor();
    /**
     * Factory — validates forDate presence/absence matches taskKind.
     * This is the domain guard that ensures the unique-index trick works correctly.
     */
    static create(props: {
        id: string;
        journeyId: JourneyId;
        userId: UserId;
        taskDefinitionId: string;
        taskKindSnapshot: TaskKindSnapshot;
        forDate: string | null;
    }): TaskCompletion;
    /**
     * Reconstruct from persistence (bypasses factory validation — already validated on create).
     */
    static reconstitute(props: {
        id: string;
        journeyId: JourneyId;
        userId: UserId;
        taskDefinitionId: string;
        taskKindSnapshot: TaskKindSnapshot;
        forDate: string | null;
        completedAt: Date;
        revokedAt: Date | null;
    }): TaskCompletion;
    /**
     * Soft-delete the completion. Preserves audit trail.
     * Invariant: cannot uncomplete something already uncompleted.
     */
    uncomplete(): void;
    /** True if this completion has not been revoked. */
    isActive(): boolean;
}
//# sourceMappingURL=task-completion.aggregate.d.ts.map