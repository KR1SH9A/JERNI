import { TaskCompletion } from '../../domain/task-completion.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';

export interface TaskCompletionRepository {
  /**
   * Find an active (non-revoked) completion for a given combination.
   * `forDate` is null for MILESTONE tasks, an ISO date string for RECURRING.
   */
  findActive(
    journeyId: JourneyId,
    userId: UserId,
    taskDefinitionId: string,
    forDate: string | null,
  ): Promise<TaskCompletion | null>;

  /**
   * Find any completion (active or revoked) for a given combination.
   */
  findAny(
    journeyId: JourneyId,
    userId: UserId,
    taskDefinitionId: string,
    forDate: string | null,
  ): Promise<TaskCompletion | null>;

  /**
   * Find all completions (including revoked) for a user within a journey.
   * Used by GetMyProgressQuery to seed initial checkbox state on the frontend.
   */
  findAllForUser(journeyId: JourneyId, userId: UserId): Promise<TaskCompletion[]>;

  save(completion: TaskCompletion): Promise<void>;
}

export const TASK_COMPLETION_REPOSITORY = Symbol('TASK_COMPLETION_REPOSITORY');
