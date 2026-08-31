import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { DomainError } from '../errors/domain.error';
/**
 * Maps DomainErrors to appropriate HTTP responses.
 *
 * Registered globally so controllers stay free of try/catch blocks.
 * The mapping below is intentional — add cases as new domain error codes emerge.
 */
export declare class DomainErrorFilter implements ExceptionFilter {
    catch(error: DomainError, host: ArgumentsHost): void;
}
//# sourceMappingURL=domain-error.filter.d.ts.map