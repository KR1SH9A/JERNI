import { IEvent } from '@nestjs/cqrs';

// ─── Participation Events ────────────────────────────────────────────────────

export class MemberJoinedEvent implements IEvent {
  constructor(
    public readonly journeyId: string,
    public readonly userId: string,
    public readonly joinedAt: Date,
  ) {}
}

export class MemberLeftEvent implements IEvent {
  constructor(
    public readonly journeyId: string,
    public readonly userId: string,
  ) {}
}

// ─── Execution Events ────────────────────────────────────────────────────────

export class TaskCompletedEvent implements IEvent {
  constructor(
    public readonly journeyId: string,
    public readonly userId: string,
    public readonly taskDefinitionId: string,
    public readonly taskKind: 'MILESTONE' | 'RECURRING',
    public readonly forDate: string | null,
  ) {}
}

export class TaskUncompletedEvent implements IEvent {
  constructor(
    public readonly journeyId: string,
    public readonly userId: string,
    public readonly taskDefinitionId: string,
    public readonly forDate: string | null,
  ) {}
}

// ─── Engagement Events ───────────────────────────────────────────────────────

export class JourneyLikedEvent implements IEvent {
  constructor(
    public readonly journeyId: string,
    public readonly userId: string,
  ) {}
}

export class JourneyUnlikedEvent implements IEvent {
  constructor(
    public readonly journeyId: string,
    public readonly userId: string,
  ) {}
}
