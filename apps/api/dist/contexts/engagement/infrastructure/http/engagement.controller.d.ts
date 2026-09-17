import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { LikeJourneyUseCase, UnlikeJourneyUseCase } from '../../application/use-cases/engagement.commands';
import { LikeRepository } from '../../application/ports/like.repository';
export declare class EngagementController {
    private readonly likeJourney;
    private readonly unlikeJourney;
    private readonly likeRepo;
    constructor(likeJourney: LikeJourneyUseCase, unlikeJourney: UnlikeJourneyUseCase, likeRepo: LikeRepository);
    /**
     * GET /journeys/:id/likes/me — Check if the current user has liked this journey.
     * Used by the journey detail page to seed initialIsLiked on the LikeButton.
     */
    isLiked(journeyId: string, user: AuthenticatedUser): Promise<{
        isLiked: boolean;
    }>;
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