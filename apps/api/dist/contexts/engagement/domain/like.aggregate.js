"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Like = void 0;
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
class Like {
    id;
    journeyId;
    userId;
    likedAt;
    constructor(props) {
        this.id = props.id;
        this.journeyId = props.journeyId;
        this.userId = props.userId;
        this.likedAt = props.likedAt ?? new Date();
    }
}
exports.Like = Like;
//# sourceMappingURL=like.aggregate.js.map