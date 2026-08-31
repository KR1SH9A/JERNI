import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../errors/domain.error';

/**
 * Maps DomainErrors to appropriate HTTP responses.
 *
 * Registered globally so controllers stay free of try/catch blocks.
 * The mapping below is intentional — add cases as new domain error codes emerge.
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusMap: Record<string, number> = {
      JOURNEY_NOT_DRAFT: HttpStatus.CONFLICT,
      JOURNEY_HAS_NO_TASKS: HttpStatus.UNPROCESSABLE_ENTITY,
      JOURNEY_NOT_PUBLISHED: HttpStatus.CONFLICT,
      JOURNEY_ARCHIVED: HttpStatus.CONFLICT,
      TASK_ORDER_INDEX_DUPLICATE: HttpStatus.CONFLICT,
      TASK_MISSING_RECURRENCE_RULE: HttpStatus.BAD_REQUEST,
      TASK_UNEXPECTED_RECURRENCE_RULE: HttpStatus.BAD_REQUEST,
      FEATURE_DISABLED: HttpStatus.FORBIDDEN,
      UNAUTHORIZED_ACTION: HttpStatus.FORBIDDEN,
    };

    const statusCode = statusMap[error.code] ?? HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(statusCode).json({
      statusCode,
      error: error.code,
      message: error.message,
    });
  }
}
