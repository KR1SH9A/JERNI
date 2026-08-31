"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyId = void 0;
/**
 * JourneyId — branded UUID for journeys.
 */
class JourneyId {
    value;
    _brand = 'JourneyId';
    constructor(value) {
        this.value = value;
    }
    static of(raw) {
        if (!raw || raw.trim() === '') {
            throw new Error('JourneyId cannot be empty');
        }
        return new JourneyId(raw);
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
exports.JourneyId = JourneyId;
//# sourceMappingURL=journey-id.vo.js.map