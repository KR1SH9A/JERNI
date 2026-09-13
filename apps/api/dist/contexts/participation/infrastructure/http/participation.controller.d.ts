import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { JoinJourneyUseCase, LeaveJourneyUseCase } from '../../application/use-cases/participation.commands';
import { GetMembershipStatusQuery } from '../../application/use-cases/participation.queries';
export declare class ParticipationController {
    private readonly joinJourney;
    private readonly leaveJourney;
    private readonly membershipStatus;
    constructor(joinJourney: JoinJourneyUseCase, leaveJourney: LeaveJourneyUseCase, membershipStatus: GetMembershipStatusQuery);
    /**
     * POST /journeys/:id/memberships — Join a journey.
     * Anyone (including the curator) may join a published, public journey.
     */
    join(journeyId: string, user: AuthenticatedUser): Promise<{
        journeyId: string;
        userId: string;
        joinedAt: Date;
    }>;
    /**
     * DELETE /journeys/:id/memberships/me — Leave a journey.
     */
    leave(journeyId: string, user: AuthenticatedUser): Promise<void>;
    /**
     * GET /journeys/:id/memberships/me — Check if the current user is a member.
     * Used by the frontend to seed join button state server-side.
     */
    myStatus(journeyId: string, user: AuthenticatedUser): Promise<import("../../application/use-cases/participation.queries").MembershipStatusResult>;
}
//# sourceMappingURL=participation.controller.d.ts.map