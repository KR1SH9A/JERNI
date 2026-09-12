import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Membership } from '../../domain/membership.aggregate';
import { MembershipRepository, MEMBERSHIP_REPOSITORY } from '../ports/membership.repository';
import { JourneyRepository, JOURNEY_REPOSITORY } from '../../../curation/application/ports/journey.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { DomainError } from '../../../../shared-kernel/errors/domain.error';
import { MemberJoinedEvent, MemberLeftEvent } from '../../../../shared-kernel/events';

// ─── JoinJourney ─────────────────────────────────────────────────────────────

export interface JoinJourneyCommand {
  journeyId: string;
  userId: string;
}

@Injectable()
export class JoinJourneyUseCase {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepo: MembershipRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: JoinJourneyCommand): Promise<Membership> {
    const journeyId = JourneyId.of(cmd.journeyId);
    const userId = UserId.of(cmd.userId);

    // Load journey and validate it can be joined
    const journey = await this.journeyRepo.findById(journeyId);
    if (!journey) {
      throw new NotFoundException(`Journey ${cmd.journeyId} not found`);
    }

    // canBeJoined() checks status === 'PUBLISHED' && visibility === 'PUBLIC'
    // Curator is allowed to join their own journey — no exception here
    if (!journey.canBeJoined()) {
      throw new DomainError(
        'This journey cannot be joined. It must be published and public.',
        'JOURNEY_NOT_JOINABLE',
      );
    }

    // Guard: already an active member?
    const existing = await this.membershipRepo.findActive(journeyId, userId);
    if (existing) {
      throw new DomainError(
        'You are already a member of this journey.',
        'ALREADY_A_MEMBER',
      );
    }

    const membership = new Membership({
      id: randomUUID(),
      journeyId,
      userId,
    });

    await this.membershipRepo.save(membership);

    this.eventBus.publish(
      new MemberJoinedEvent(cmd.journeyId, cmd.userId, membership.joinedAt),
    );

    return membership;
  }
}

// ─── LeaveJourney ────────────────────────────────────────────────────────────

export interface LeaveJourneyCommand {
  journeyId: string;
  userId: string;
}

@Injectable()
export class LeaveJourneyUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepo: MembershipRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: LeaveJourneyCommand): Promise<void> {
    const membership = await this.membershipRepo.findActive(
      JourneyId.of(cmd.journeyId),
      UserId.of(cmd.userId),
    );

    if (!membership) {
      throw new NotFoundException(
        `No active membership found for journey ${cmd.journeyId}`,
      );
    }

    // leave() enforces: cannot leave twice
    membership.leave();
    await this.membershipRepo.save(membership);

    this.eventBus.publish(new MemberLeftEvent(cmd.journeyId, cmd.userId));
  }
}
