import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TaskUncompletedEvent } from '../../../../shared-kernel/events';
import { StatsRepository, STATS_REPOSITORY } from '../ports/stats.repository';

/**
 * TaskUncompletedHandler — mirrors TaskCompletedHandler but with delta=-1.
 *
 * The DB CHECK (>= 0) on both tables ensures count never goes negative,
 * even if events arrive out of order during a replay.
 *
 * forDate is whatever was stored on the completion record:
 *  - null  for MILESTONE (use today for daily_stats; milestone cannot be uncompleted on a different day)
 *  - 'YYYY-MM-DD' for RECURRING (always today — UncompleteTask enforces this)
 */
@EventsHandler(TaskUncompletedEvent)
export class TaskUncompletedHandler implements IEventHandler<TaskUncompletedEvent> {
  constructor(
    @Inject(STATS_REPOSITORY)
    private readonly statsRepo: StatsRepository,
  ) {}

  async handle(event: TaskUncompletedEvent): Promise<void> {
    const forDate = event.forDate ?? new Date().toISOString().split('T')[0];

    // We need the taskKind to know which all_time_stats counter to decrement.
    // The event carries forDate — null = MILESTONE, non-null = RECURRING.
    const taskKind: 'MILESTONE' | 'RECURRING' = event.forDate === null ? 'MILESTONE' : 'RECURRING';

    await Promise.all([
      this.statsRepo.upsertDailyStat(
        event.journeyId,
        event.userId,
        event.taskDefinitionId,
        forDate,
        -1,
      ),
      this.statsRepo.upsertAllTimeStat(
        event.journeyId,
        event.userId,
        taskKind,
        event.forDate,
        -1,
      ),
    ]);
  }
}
