import { Injectable, Inject } from '@nestjs/common';
import { MembershipRepository, MEMBERSHIP_REPOSITORY } from '../ports/membership.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { JourneyRepository, JOURNEY_REPOSITORY } from '../../../curation/application/ports/journey.repository';

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

// ─── GetJoinedJourneys ────────────────────────────────────────────────────────

export interface JoinedJourneyCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  visibility: string;
  likeCount: number;
  taskCount: number;
  curatorId: string;
  coverProvider: string | null;
  coverAssetId: string | null;
  createdAt: Date;
  joinedAt: Date;
}

export interface JoinedJourneysResult {
  journeys: JoinedJourneyCard[];
  total: number;
}

@Injectable()
export class GetJoinedJourneysQuery {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepo: MembershipRepository,
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(userId: string): Promise<JoinedJourneysResult> {
    const memberships = await this.membershipRepo.findAllActiveByUserId(UserId.of(userId));
    if (memberships.length === 0) return { journeys: [], total: 0 };

    // Bulk-load all joined journeys — one findById per membership
    // (the set is typically small; a user rarely joins hundreds of journeys)
    const journeyOrNulls = await Promise.all(
      memberships.map((m) => this.journeyRepo.findById(m.journeyId)),
    );

    const journeys: JoinedJourneyCard[] = [];
    for (let i = 0; i < journeyOrNulls.length; i++) {
      const j = journeyOrNulls[i];
      if (!j) continue; // journey deleted after membership — skip
      journeys.push({
        id: j.id.value,
        title: j.title,
        description: j.description,
        tags: j.tags,
        status: j.status,
        visibility: j.visibility,
        likeCount: j.likeCount,
        taskCount: j.taskDefinitions.length,
        curatorId: j.curatorId.value,
        coverProvider: j.coverProvider,
        coverAssetId: j.coverAssetId,
        createdAt: j.createdAt,
        joinedAt: memberships[i].joinedAt,
      });
    }

    return { journeys, total: journeys.length };
  }
}
