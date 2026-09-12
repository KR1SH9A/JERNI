import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JourneyLikedEvent, JourneyUnlikedEvent } from '../../../../shared-kernel/events';
import { JourneyRepository, JOURNEY_REPOSITORY } from '../../application/ports/journey.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';

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
@EventsHandler(JourneyLikedEvent, JourneyUnlikedEvent)
export class LikeCountProjection
  implements IEventHandler<JourneyLikedEvent | JourneyUnlikedEvent>
{
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async handle(event: JourneyLikedEvent | JourneyUnlikedEvent): Promise<void> {
    const journey = await this.journeyRepo.findById(JourneyId.of(event.journeyId));
    if (!journey) return; // Journey deleted between event publish and handling — safe to skip

    if (event instanceof JourneyLikedEvent) {
      journey.incrementLikeCount();
    } else {
      journey.decrementLikeCount();
    }

    await this.journeyRepo.save(journey);
  }
}
