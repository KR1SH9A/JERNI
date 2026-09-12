import { TaskCompletionRepository } from '../ports/task-completion.repository';
export interface TaskProgressReadModel {
    taskDefinitionId: string;
    taskKindSnapshot: string;
    /** ISO date string for recurring; null for milestone */
    forDate: string | null;
    completedAt: Date;
    /** null = still active, timestamp = uncompleted */
    revokedAt: Date | null;
    isActive: boolean;
}
export interface MyProgressResult {
    journeyId: string;
    userId: string;
    completions: TaskProgressReadModel[];
}
export declare class GetMyProgressQuery {
    private readonly completionRepo;
    constructor(completionRepo: TaskCompletionRepository);
    /**
     * Returns all completion records (including revoked) for a user within a journey.
     * The frontend uses this to seed checkbox state:
     *  - MILESTONE: checked if any active completion exists
     *  - RECURRING: checked if an active completion exists with forDate = today
     */
    execute(journeyId: string, userId: string): Promise<MyProgressResult>;
}
//# sourceMappingURL=execution.queries.d.ts.map