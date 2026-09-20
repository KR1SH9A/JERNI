import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import {
  TaskCompletedEvent,
  TaskUncompletedEvent,
  MemberJoinedEvent,
  MemberLeftEvent,
  JourneyLikedEvent,
  JourneyUnlikedEvent,
} from '../../shared-kernel/events';

/**
 * Realtime event listeners — bridge between the CQRS EventBus and Socket.io rooms.
 *
 * Each handler is a pure subscriber: it reads the event payload, formats it into a
 * socket-friendly shape, and calls RealtimeService.emitToJourneyRoom(). No DB
 * access, no business decisions — this is strictly a delivery mechanism.
 *
 * Note: `stats.updated` is always emitted alongside the raw event so the frontend
 * StatsPanel knows to re-fetch via REST (keeps the gateway stateless — no denormalized
 * stats here).
 */

// ─── Task events ─────────────────────────────────────────────────────────────

@EventsHandler(TaskCompletedEvent)
export class TaskCompletedRealtimeHandler
  implements IEventHandler<TaskCompletedEvent>
{
  private readonly logger = new Logger(TaskCompletedRealtimeHandler.name);

  constructor(private readonly realtime: RealtimeService) {}

  handle(event: TaskCompletedEvent): void {
    this.logger.debug(`Broadcasting task.completed for journey ${event.journeyId}`);

    this.realtime.emitToJourneyRoom(event.journeyId, 'task.completed', {
      journeyId: event.journeyId,
      userId: event.userId,
      taskDefinitionId: event.taskDefinitionId,
      taskKind: event.taskKind,
      forDate: event.forDate,
    });

    // Signal: please re-fetch stats
    this.realtime.emitToJourneyRoom(event.journeyId, 'stats.updated', {
      journeyId: event.journeyId,
    });
  }
}

@EventsHandler(TaskUncompletedEvent)
export class TaskUncompletedRealtimeHandler
  implements IEventHandler<TaskUncompletedEvent>
{
  private readonly logger = new Logger(TaskUncompletedRealtimeHandler.name);

  constructor(private readonly realtime: RealtimeService) {}

  handle(event: TaskUncompletedEvent): void {
    this.logger.debug(`Broadcasting task.uncompleted for journey ${event.journeyId}`);

    this.realtime.emitToJourneyRoom(event.journeyId, 'task.uncompleted', {
      journeyId: event.journeyId,
      userId: event.userId,
      taskDefinitionId: event.taskDefinitionId,
      forDate: event.forDate,
    });

    this.realtime.emitToJourneyRoom(event.journeyId, 'stats.updated', {
      journeyId: event.journeyId,
    });
  }
}

// ─── Participation events ────────────────────────────────────────────────────

@EventsHandler(MemberJoinedEvent)
export class MemberJoinedRealtimeHandler
  implements IEventHandler<MemberJoinedEvent>
{
  private readonly logger = new Logger(MemberJoinedRealtimeHandler.name);

  constructor(private readonly realtime: RealtimeService) {}

  handle(event: MemberJoinedEvent): void {
    this.logger.debug(`Broadcasting member.joined for journey ${event.journeyId}`);

    this.realtime.emitToJourneyRoom(event.journeyId, 'member.joined', {
      journeyId: event.journeyId,
      userId: event.userId,
      joinedAt: event.joinedAt,
    });
  }
}

@EventsHandler(MemberLeftEvent)
export class MemberLeftRealtimeHandler
  implements IEventHandler<MemberLeftEvent>
{
  private readonly logger = new Logger(MemberLeftRealtimeHandler.name);

  constructor(private readonly realtime: RealtimeService) {}

  handle(event: MemberLeftEvent): void {
    this.logger.debug(`Broadcasting member.left for journey ${event.journeyId}`);

    this.realtime.emitToJourneyRoom(event.journeyId, 'member.left', {
      journeyId: event.journeyId,
      userId: event.userId,
    });
  }
}

// ─── Engagement events ───────────────────────────────────────────────────────

@EventsHandler(JourneyLikedEvent)
export class JourneyLikedRealtimeHandler
  implements IEventHandler<JourneyLikedEvent>
{
  constructor(private readonly realtime: RealtimeService) {}

  handle(event: JourneyLikedEvent): void {
    this.realtime.emitToJourneyRoom(event.journeyId, 'journey.liked', {
      journeyId: event.journeyId,
      userId: event.userId,
    });
  }
}

@EventsHandler(JourneyUnlikedEvent)
export class JourneyUnlikedRealtimeHandler
  implements IEventHandler<JourneyUnlikedEvent>
{
  constructor(private readonly realtime: RealtimeService) {}

  handle(event: JourneyUnlikedEvent): void {
    this.realtime.emitToJourneyRoom(event.journeyId, 'journey.unliked', {
      journeyId: event.journeyId,
      userId: event.userId,
    });
  }
}

/** Convenience barrel — all handlers collected for module registration. */
export const REALTIME_EVENT_HANDLERS = [
  TaskCompletedRealtimeHandler,
  TaskUncompletedRealtimeHandler,
  MemberJoinedRealtimeHandler,
  MemberLeftRealtimeHandler,
  JourneyLikedRealtimeHandler,
  JourneyUnlikedRealtimeHandler,
];
