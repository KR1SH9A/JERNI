"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = void 0;
/**
 * UserId — a branded string value object wrapping the Supabase auth.uid().
 *
 * Rule: no other context ever stores a raw `string` where a UserId is expected.
 * This makes cross-context leakage (e.g. passing a JourneyId as a UserId) a
 * compile-time error, not a runtime mystery.
 */
class UserId {
    value;
    _brand = 'UserId';
    constructor(value) {
        this.value = value;
    }
    static of(raw) {
        if (!raw || raw.trim() === '') {
            throw new Error('UserId cannot be empty');
        }
        return new UserId(raw);
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
    toJSON() {
        return this.value;
    }
}
exports.UserId = UserId;
//# sourceMappingURL=user-id.vo.js.map