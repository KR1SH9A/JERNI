import { Injectable, Inject } from '@nestjs/common';
import { TaskCompletionRepository, TASK_COMPLETION_REPOSITORY } from '../ports/task-completion.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';

// ─── Read Models ──────────────────────────────────────────────────────────────

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

// ─── GetMyProgress ────────────────────────────────────────────────────────────

@Injectable()
export class GetMyProgressQuery {
  constructor(
    @Inject(TASK_COMPLETION_REPOSITORY)
    private readonly completionRepo: TaskCompletionRepository,
  ) {}

  /**
   * Returns all completion records (including revoked) for a user within a journey.
   * The frontend uses this to seed checkbox state:
   *  - MILESTONE: checked if any active completion exists
   *  - RECURRING: checked if an active completion exists with forDate = today
   */
  async execute(journeyId: string, userId: string): Promise<MyProgressResult> {
    const completions = await this.completionRepo.findAllForUser(
      JourneyId.of(journeyId),
      UserId.of(userId),
    );

    return {
      journeyId,
      userId,
      completions: completions.map((c) => ({
        taskDefinitionId: c.taskDefinitionId,
        taskKindSnapshot: c.taskKindSnapshot,
        forDate: c.forDate,
        completedAt: c.completedAt,
        revokedAt: c.revokedAt,
        isActive: c.isActive(),
      })),
    };
  }
}
