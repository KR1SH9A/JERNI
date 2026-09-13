import { JourneyId } from '../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../shared-kernel/value-objects/user-id.vo';
/**
 * Like — Aggregate Root for the Engagement bounded context.
 *
 * A Like is a toggle, not a counter. It is created or deleted atomically.
 * There are intentionally NO dislike semantics — the aggregate shape itself
 * encodes this decision, so adding dislikes later is a real modeling change,
 * not a config flag.
 *
 * Invariant (DB-level): UNIQUE (journey_id, user_id) — one like per user per journey.
 * Idempotency is handled in the use-case layer (check before create/delete),
 * not here, because the aggregate has no meaningful state to protect beyond existence.
 */
export declare class Like {
    readonly id: string;
    readonly journeyId: JourneyId;
    readonly userId: UserId;
    readonly likedAt: Date;
    constructor(props: {
        id: string;
        journeyId: JourneyId;
        userId: UserId;
        likedAt?: Date;
    });
}
//# sourceMappingURL=like.aggregate.d.ts.map