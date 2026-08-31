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
export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
