import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { TaskCompletion } from '../../domain/task-completion.aggregate';
import { TaskCompletionRepository, TASK_COMPLETION_REPOSITORY } from '../ports/task-completion.repository';
import { MembershipRepository, MEMBERSHIP_REPOSITORY } from '../../../participation/application/ports/membership.repository';
import { JourneyRepository, JOURNEY_REPOSITORY } from '../../../curation/application/ports/journey.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { DomainError } from '../../../../shared-kernel/errors/domain.error';
import { TaskCompletedEvent, TaskUncompletedEvent } from '../../../../shared-kernel/events';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns today's date as 'YYYY-MM-DD' in UTC. Recurring completions are scoped to this. */
function todayUtc(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── CompleteTask ─────────────────────────────────────────────────────────────

export interface CompleteTaskCommand {
  journeyId: string;
  taskDefinitionId: string;
  userId: string;
}

@Injectable()
export class CompleteTaskUseCase {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepo: MembershipRepository,
    @Inject(TASK_COMPLETION_REPOSITORY)
    private readonly completionRepo: TaskCompletionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: CompleteTaskCommand): Promise<TaskCompletion> {
    const journeyId = JourneyId.of(cmd.journeyId);
    const userId = UserId.of(cmd.userId);

    // 1. Load journey — must be PUBLISHED
    const journey = await this.journeyRepo.findById(journeyId);
    if (!journey) {
      throw new NotFoundException(`Journey ${cmd.journeyId} not found`);
    }
    if (journey.status !== 'PUBLISHED') {
      throw new DomainError('Cannot complete tasks on an unpublished journey.', 'JOURNEY_NOT_PUBLISHED');
    }

    // 2. Verify the user is an active member
    const membership = await this.membershipRepo.findActive(journeyId, userId);
    if (!membership) {
      throw new DomainError(
        'You must be a member of this journey to complete tasks.',
        'NOT_A_MEMBER',
      );
    }

    // 3. Find the task definition — snapshot its kind at this moment
    const taskDef = journey.taskDefinitions.find((t) => t.id === cmd.taskDefinitionId);
    if (!taskDef) {
      throw new NotFoundException(`Task ${cmd.taskDefinitionId} not found on journey ${cmd.journeyId}`);
    }

    // 4. Determine forDate based on task kind (snapshot happens here)
    const forDate = taskDef.kind === 'RECURRING' ? todayUtc() : null;

    // 5. Check if completion exists
    let completion = await this.completionRepo.findAny(journeyId, userId, cmd.taskDefinitionId, forDate);

    if (completion) {
      if (completion.isActive()) {
        throw new DomainError(
          'This task has already been completed.',
          'TASK_ALREADY_COMPLETED',
        );
      }
      // Re-complete the revoked one to avoid unique constraint violations
      completion.recomplete();
    } else {
      // 6. Create the completion (domain factory validates forDate/kind consistency)
      completion = TaskCompletion.create({
        id: randomUUID(),
        journeyId,
        userId,
        taskDefinitionId: cmd.taskDefinitionId,
        taskKindSnapshot: taskDef.kind, // ← snapshot at completion time
        forDate,
      });
    }

    await this.completionRepo.save(completion);

    this.eventBus.publish(
      new TaskCompletedEvent(cmd.journeyId, cmd.userId, cmd.taskDefinitionId, taskDef.kind, forDate),
    );

    return completion;
  }
}

// ─── UncompleteTask ───────────────────────────────────────────────────────────

export interface UncompleteTaskCommand {
  journeyId: string;
  taskDefinitionId: string;
  userId: string;
}

@Injectable()
export class UncompleteTaskUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepo: MembershipRepository,
    @Inject(TASK_COMPLETION_REPOSITORY)
    private readonly completionRepo: TaskCompletionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: UncompleteTaskCommand): Promise<void> {
    const journeyId = JourneyId.of(cmd.journeyId);
    const userId = UserId.of(cmd.userId);

    // Verify membership
    const membership = await this.membershipRepo.findActive(journeyId, userId);
    if (!membership) {
      throw new DomainError(
        'You must be a member of this journey to uncomplete tasks.',
        'NOT_A_MEMBER',
      );
    }

    // For recurring tasks, forDate is always today (can only uncomplete today's completion)
    // We need to know the kind — find by trying both: null (milestone) first, then today (recurring)
    let completion = await this.completionRepo.findActive(journeyId, userId, cmd.taskDefinitionId, null);
    if (!completion) {
      completion = await this.completionRepo.findActive(journeyId, userId, cmd.taskDefinitionId, todayUtc());
    }

    if (!completion) {
      throw new NotFoundException(
        `No active completion found for task ${cmd.taskDefinitionId}`,
      );
    }

    // uncomplete() enforces: cannot revoke twice
    completion.uncomplete();
    await this.completionRepo.save(completion);

    this.eventBus.publish(
      new TaskUncompletedEvent(cmd.journeyId, cmd.userId, cmd.taskDefinitionId, completion.forDate),
    );
  }
}
