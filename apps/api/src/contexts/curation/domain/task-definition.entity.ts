import { DomainError } from '../../../shared-kernel/errors/domain.error';

export type TaskKind = 'MILESTONE' | 'RECURRING';
export type RecurrenceRule = 'DAILY' | null;

/**
 * TaskDefinition — Entity, owned inside the Journey aggregate boundary.
 *
 * NOT a standalone aggregate root — it can only be created through Journey.addTask().
 * This enforces the invariant that task creation is always validated against the
 * journey's current state.
 */
export class TaskDefinition {
  readonly id: string;
  readonly journeyId: string;
  title: string;
  readonly orderIndex: number;
  readonly kind: TaskKind;
  readonly recurrenceRule: RecurrenceRule;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    journeyId: string;
    title: string;
    orderIndex: number;
    kind: TaskKind;
    recurrenceRule?: RecurrenceRule;
    createdAt?: Date;
  }) {
    // Invariant: recurrenceRule is only valid for RECURRING tasks
    if (props.kind === 'RECURRING' && !props.recurrenceRule) {
      throw new DomainError(
        'A RECURRING task must have a recurrenceRule (e.g. "DAILY").',
        'TASK_MISSING_RECURRENCE_RULE',
      );
    }
    if (props.kind === 'MILESTONE' && props.recurrenceRule) {
      throw new DomainError(
        'A MILESTONE task cannot have a recurrenceRule.',
        'TASK_UNEXPECTED_RECURRENCE_RULE',
      );
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
