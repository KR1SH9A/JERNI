"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
/**
 * DomainError — base class for all domain-layer errors.
 *
 * Using a dedicated error class (vs throwing plain Error) lets infrastructure
 * layers (controllers, exception filters) map these to appropriate HTTP status
 * codes without leaking domain details into the HTTP layer.
 *
 * `code` is a machine-readable string used by the frontend for i18n and
 * conditional handling (e.g. 'JOURNEY_NOT_DRAFT' → 409 Conflict).
 */
class DomainError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
        // Maintain proper prototype chain
        Object.setPrototypeOf(this, DomainError.prototype);
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=domain.error.js.map