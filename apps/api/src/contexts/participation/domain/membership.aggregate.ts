import { JourneyId } from '../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../shared-kernel/value-objects/user-id.vo';
import { DomainError } from '../../../shared-kernel/errors/domain.error';

export type MembershipStatus = 'ACTIVE' | 'LEFT';

/**
 * Membership — Aggregate Root for the Participation bounded context.
 *
 * Invariants enforced here:
 *  - Cannot leave a membership that is already in LEFT status.
 *
 * The one-active-membership-per-(journey, user) invariant is enforced at the
 * DB level via a unique partial index (WHERE status = 'ACTIVE'), not in this
 * aggregate — that constraint survives race conditions that app-layer checks miss.
 */
export class Membership {
  readonly id: string;
  readonly journeyId: JourneyId;
  readonly userId: UserId;
  readonly joinedAt: Date;
  status: MembershipStatus;

  constructor(props: {
    id: string;
    journeyId: JourneyId;
    userId: UserId;
    joinedAt?: Date;
    status?: MembershipStatus;
  }) {
    this.id = props.id;
    this.journeyId = props.journeyId;
    this.userId = props.userId;
    this.joinedAt = props.joinedAt ?? new Date();
    this.status = props.status ?? 'ACTIVE';
  }

  /**
   * Leave a journey. Sets status to LEFT.
   * Invariant: cannot leave twice.
   */
  leave(): void {
    if (this.status === 'LEFT') {
      throw new DomainError(
        'You have already left this journey.',
        'MEMBERSHIP_ALREADY_LEFT',
      );
    }
    this.status = 'LEFT';
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}
