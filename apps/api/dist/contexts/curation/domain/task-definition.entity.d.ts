export type TaskKind = 'MILESTONE' | 'RECURRING';
export type RecurrenceRule = 'DAILY' | null;
/**
 * TaskDefinition — Entity, owned inside the Journey aggregate boundary.
 *
 * NOT a standalone aggregate root — it can only be created through Journey.addTask().
 * This enforces the invariant that task creation is always validated against the
 * journey's current state.
 */
export declare class TaskDefinition {
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
    });
}
//# sourceMappingURL=task-definition.entity.d.ts.map