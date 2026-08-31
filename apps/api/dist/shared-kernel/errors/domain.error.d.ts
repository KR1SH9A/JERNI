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
export declare class DomainError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
//# sourceMappingURL=domain.error.d.ts.map