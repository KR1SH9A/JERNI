"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Membership = void 0;
const domain_error_1 = require("../../../shared-kernel/errors/domain.error");
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
class Membership {
    id;
    journeyId;
    userId;
    joinedAt;
    status;
    constructor(props) {
        this.id = props.id;
        this.journeyId = props.journeyId;
        this.userId = props.userId;
        this.joinedAt = props.joinedAt ?? new Date();
        this.status = props.status ?? 'ACTIVE';
    }
    /**
     * Leave a journey. Sets status to LEFT.
     * Invariant: cannot leave twice.
     */
    leave() {
        if (this.status === 'LEFT') {
            throw new domain_error_1.DomainError('You have already left this journey.', 'MEMBERSHIP_ALREADY_LEFT');
        }
        this.status = 'LEFT';
    }
    isActive() {
        return this.status === 'ACTIVE';
    }
}
exports.Membership = Membership;
//# sourceMappingURL=membership.aggregate.js.map