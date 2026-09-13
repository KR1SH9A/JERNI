export declare class TaskCompletionOrmEntity {
    id: string;
    journeyId: string;
    userId: string;
    taskDefinitionId: string;
    taskKindSnapshot: string;
    /**
     * ISO date string 'YYYY-MM-DD' for RECURRING tasks; null for MILESTONE.
     * The DB unique constraint treats NULL = NULL (NULLS NOT DISTINCT),
     * so two milestone completions for the same task will violate the constraint.
     */
    forDate: string | null;
    completedAt: Date;
    revokedAt: Date | null;
}
//# sourceMappingURL=task-completion.orm-entity.d.ts.map