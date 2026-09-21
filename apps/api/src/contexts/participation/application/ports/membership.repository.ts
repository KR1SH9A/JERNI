import { Membership } from '../../domain/membership.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';

export interface MembershipRepository {
  /**
   * Find the ACTIVE membership for a given (journey, user) pair.
   * Returns null if no active membership exists.
   */
  findActive(journeyId: JourneyId, userId: UserId): Promise<Membership | null>;

  /**
   * Find all ACTIVE memberships for a given user across all journeys.
   * Used to build the "journeys I joined" section on the user dashboard.
   */
  findAllActiveByUserId(userId: UserId): Promise<Membership[]>;

  /** Persist a membership (create or update). */
  save(membership: Membership): Promise<void>;
}

export const MEMBERSHIP_REPOSITORY = Symbol('MEMBERSHIP_REPOSITORY');
