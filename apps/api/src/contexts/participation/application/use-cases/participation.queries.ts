import { Injectable, Inject } from '@nestjs/common';
import { MembershipRepository, MEMBERSHIP_REPOSITORY } from '../ports/membership.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';

// ─── GetMembershipStatus ──────────────────────────────────────────────────────

export interface MembershipStatusResult {
  isMember: boolean;
}

@Injectable()
export class GetMembershipStatusQuery {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepo: MembershipRepository,
  ) {}

  async execute(journeyId: string, userId: string): Promise<MembershipStatusResult> {
    const membership = await this.membershipRepo.findActive(
      JourneyId.of(journeyId),
      UserId.of(userId),
    );
    return { isMember: membership !== null };
  }
}
