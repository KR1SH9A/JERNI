"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCompletion = void 0;
const domain_error_1 = require("../../../shared-kernel/errors/domain.error");
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
class TaskCompletion {
    id;
    journeyId;
    userId;
    taskDefinitionId;
    taskKindSnapshot;
    /** ISO date string 'YYYY-MM-DD' for RECURRING; null for MILESTONE */
    forDate;
    completedAt;
    revokedAt;
    constructor(props) {
        this.id = props.id;
        this.journeyId = props.journeyId;
        this.userId = props.userId;
        this.taskDefinitionId = props.taskDefinitionId;
        this.taskKindSnapshot = props.taskKindSnapshot;
        this.forDate = props.forDate;
        this.completedAt = props.completedAt ?? new Date();
        this.revokedAt = props.revokedAt ?? null;
    }
    /**
     * Factory — validates forDate presence/absence matches taskKind.
     * This is the domain guard that ensures the unique-index trick works correctly.
     */
    static create(props) {
        if (props.taskKindSnapshot === 'RECURRING' && !props.forDate) {
            throw new domain_error_1.DomainError('RECURRING task completion requires a forDate (ISO date string).', 'RECURRING_MISSING_FOR_DATE');
        }
        if (props.taskKindSnapshot === 'MILESTONE' && props.forDate !== null) {
            throw new domain_error_1.DomainError('MILESTONE task completion must not have a forDate.', 'MILESTONE_UNEXPECTED_FOR_DATE');
        }
        return new TaskCompletion(props);
    }
    /**
     * Reconstruct from persistence (bypasses factory validation — already validated on create).
     */
    static reconstitute(props) {
        return new TaskCompletion(props);
    }
    /**
     * Soft-delete the completion. Preserves audit trail.
     * Invariant: cannot uncomplete something already uncompleted.
     */
    uncomplete() {
        if (this.revokedAt !== null) {
            throw new domain_error_1.DomainError('This task completion has already been uncompleted.', 'COMPLETION_ALREADY_REVOKED');
        }
        this.revokedAt = new Date();
    }
    /** True if this completion has not been revoked. */
    isActive() {
        return this.revokedAt === null;
    }
}
exports.TaskCompletion = TaskCompletion;
//# sourceMappingURL=task-completion.aggregate.js.map