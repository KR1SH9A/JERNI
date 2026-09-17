import { IEventHandler } from '@nestjs/cqrs';
import { TaskUncompletedEvent } from '../../../../shared-kernel/events';
import { StatsRepository } from '../ports/stats.repository';
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
export declare class TaskUncompletedHandler implements IEventHandler<TaskUncompletedEvent> {
    private readonly statsRepo;
    constructor(statsRepo: StatsRepository);
    handle(event: TaskUncompletedEvent): Promise<void>;
}
//# sourceMappingURL=task-uncompleted.handler.d.ts.map