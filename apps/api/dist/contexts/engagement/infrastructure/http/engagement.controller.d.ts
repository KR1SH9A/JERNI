import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { LikeJourneyUseCase, UnlikeJourneyUseCase } from '../../application/use-cases/engagement.commands';
export declare class EngagementController {
    private readonly likeJourney;
    private readonly unlikeJourney;
    constructor(likeJourney: LikeJourneyUseCase, unlikeJourney: UnlikeJourneyUseCase);
    /**
     * POST /journeys/:id/likes — Like a journey.
     * Idempotent: liking twice is a no-op (no error, no duplicate row).
     */
    like(journeyId: string, user: AuthenticatedUser): Promise<void>;
    /**
     * DELETE /journeys/:id/likes — Unlike a journey.
     * Idempotent: unliking when not liked is a no-op.
     */
    unlike(journeyId: string, user: AuthenticatedUser): Promise<void>;
}
//# sourceMappingURL=engagement.controller.d.ts.map