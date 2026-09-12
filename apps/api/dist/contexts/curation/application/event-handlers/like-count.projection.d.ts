import { IEventHandler } from '@nestjs/cqrs';
import { JourneyLikedEvent, JourneyUnlikedEvent } from '../../../../shared-kernel/events';
import { JourneyRepository } from '../../application/ports/journey.repository';
/**
 * LikeCountProjection — event handler that keeps the denormalized `likeCount`
 * on Journey aggregate in sync with the Engagement context's Like table.
 *
 * This is the ONLY cross-context coupling in Phase 2: Engagement publishes events,
 * Curation reacts by mutating its own aggregate. Engagement never touches
 * Curation's table directly, and Curation never reads Engagement's table directly.
 *
 * If this projection falls behind (e.g. a handler crash), likeCount can be
 * rebuilt from the likes table by replaying JourneyLiked events — it is never
 * the source of truth for "who liked what", only for fast card rendering.
 */
export declare class LikeCountProjection implements IEventHandler<JourneyLikedEvent | JourneyUnlikedEvent> {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    handle(event: JourneyLikedEvent | JourneyUnlikedEvent): Promise<void>;
}
//# sourceMappingURL=like-count.projection.d.ts.map