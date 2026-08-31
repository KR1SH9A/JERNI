"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDefinition = void 0;
const domain_error_1 = require("../../../shared-kernel/errors/domain.error");
/**
 * TaskDefinition — Entity, owned inside the Journey aggregate boundary.
 *
 * NOT a standalone aggregate root — it can only be created through Journey.addTask().
 * This enforces the invariant that task creation is always validated against the
 * journey's current state.
 */
class TaskDefinition {
    id;
    journeyId;
    title;
    orderIndex;
    kind;
    recurrenceRule;
    createdAt;
    constructor(props) {
        // Invariant: recurrenceRule is only valid for RECURRING tasks
        if (props.kind === 'RECURRING' && !props.recurrenceRule) {
            throw new domain_error_1.DomainError('A RECURRING task must have a recurrenceRule (e.g. "DAILY").', 'TASK_MISSING_RECURRENCE_RULE');
        }
        if (props.kind === 'MILESTONE' && props.recurrenceRule) {
            throw new domain_error_1.DomainError('A MILESTONE task cannot have a recurrenceRule.', 'TASK_UNEXPECTED_RECURRENCE_RULE');
        }
        this.id = props.id;
        this.journeyId = props.journeyId;
        this.title = props.title;
        this.orderIndex = props.orderIndex;
        this.kind = props.kind;
        this.recurrenceRule = props.recurrenceRule ?? null;
        this.createdAt = props.createdAt ?? new Date();
    }
}
exports.TaskDefinition = TaskDefinition;
//# sourceMappingURL=task-definition.entity.js.map