import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { CompleteTaskUseCase, UncompleteTaskUseCase } from '../../application/use-cases/execution.commands';
import { GetMyProgressQuery } from '../../application/use-cases/execution.queries';
export declare class ExecutionController {
    private readonly completeTask;
    private readonly uncompleteTask;
    private readonly myProgress;
    constructor(completeTask: CompleteTaskUseCase, uncompleteTask: UncompleteTaskUseCase, myProgress: GetMyProgressQuery);
    /**
     * POST /journeys/:id/tasks/:taskId/complete — Mark a task as complete.
     * MILESTONE tasks: idempotent constraint via DB unique index (forDate = NULL).
     * RECURRING tasks: forDate = today (UTC). Can be done again tomorrow.
     */
    complete(journeyId: string, taskDefinitionId: string, user: AuthenticatedUser): Promise<{
        id: string;
        taskDefinitionId: string;
        taskKindSnapshot: import("../../domain/task-completion.aggregate").TaskKindSnapshot;
        forDate: string | null;
        completedAt: Date;
    }>;
    /**
     * DELETE /journeys/:id/tasks/:taskId/complete — Uncomplete (soft-revoke) a task.
     * For recurring tasks, this only revokes today's completion.
     */
    uncomplete(journeyId: string, taskDefinitionId: string, user: AuthenticatedUser): Promise<void>;
    /**
     * GET /journeys/:id/progress/me — Get my completion progress for this journey.
     * Used by the frontend Server Component to seed task checkbox state.
     */
    progress(journeyId: string, user: AuthenticatedUser): Promise<import("../../application/use-cases/execution.queries").MyProgressResult>;
}
//# sourceMappingURL=execution.controller.d.ts.map