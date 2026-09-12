import { JourneyId } from '../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../shared-kernel/value-objects/user-id.vo';
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
export declare class Membership {
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
    });
    /**
     * Leave a journey. Sets status to LEFT.
     * Invariant: cannot leave twice.
     */
    leave(): void;
    isActive(): boolean;
}
//# sourceMappingURL=membership.aggregate.d.ts.map