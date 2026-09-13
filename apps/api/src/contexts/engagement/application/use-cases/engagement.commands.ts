import { Injectable, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Like } from '../../domain/like.aggregate';
import { LikeRepository, LIKE_REPOSITORY } from '../ports/like.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { JourneyLikedEvent, JourneyUnlikedEvent } from '../../../../shared-kernel/events';

// ─── LikeJourney ─────────────────────────────────────────────────────────────

export interface LikeJourneyCommand {
  journeyId: string;
  userId: string;
}

@Injectable()
export class LikeJourneyUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepo: LikeRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: LikeJourneyCommand): Promise<void> {
    const journeyId = JourneyId.of(cmd.journeyId);
    const userId = UserId.of(cmd.userId);

    // Idempotent: if already liked, silently return — no duplicate event emitted
    const existing = await this.likeRepo.find(journeyId, userId);
    if (existing) return;

    const like = new Like({ id: randomUUID(), journeyId, userId });
    await this.likeRepo.save(like);

    this.eventBus.publish(new JourneyLikedEvent(cmd.journeyId, cmd.userId));
  }
}

// ─── UnlikeJourney ───────────────────────────────────────────────────────────

export interface UnlikeJourneyCommand {
  journeyId: string;
  userId: string;
}

@Injectable()
export class UnlikeJourneyUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepo: LikeRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: UnlikeJourneyCommand): Promise<void> {
    const journeyId = JourneyId.of(cmd.journeyId);
    const userId = UserId.of(cmd.userId);

    // Idempotent: if not liked, silently return — no spurious event emitted
    const existing = await this.likeRepo.find(journeyId, userId);
    if (!existing) return;

    await this.likeRepo.delete(existing);

    this.eventBus.publish(new JourneyUnlikedEvent(cmd.journeyId, cmd.userId));
  }
}
