import { IEventHandler } from '@nestjs/cqrs';
import { TaskCompletedEvent } from '../../../../shared-kernel/events';
import { StatsRepository } from '../ports/stats.repository';
/**
 * TaskCompletedHandler — CQRS event handler that projects TaskCompletedEvent
 * into the Stats read model.
 *
 * Two writes per event (both upserts, atomic at DB level):
 *  1. daily_stats — set/increment completedCount for this (journey, user, task, date)
 *  2. all_time_stats — increment milestones_completed or recurring_done_today
 *
 * forDate on the event is:
 *  - null  for MILESTONE tasks (we use today's date for daily_stats)
 *  - 'YYYY-MM-DD' for RECURRING tasks
 *
 * NOTE: both DB operations are independent. If one fails, the handler will
 * throw and NestJS CQRS will not retry by default. For production resiliency,
 * add an outbox / saga — Phase 4 concern. At current scale, the risk is
 * acceptable because stats are rebuildable from task_completions.
 */
export declare class TaskCompletedHandler implements IEventHandler<TaskCompletedEvent> {
    private readonly statsRepo;
    constructor(statsRepo: StatsRepository);
    handle(event: TaskCompletedEvent): Promise<void>;
}
//# sourceMappingURL=task-completed.handler.d.ts.map