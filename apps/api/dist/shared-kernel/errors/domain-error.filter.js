"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainErrorFilter = void 0;
const common_1 = require("@nestjs/common");
const domain_error_1 = require("../errors/domain.error");
/**
 * Maps DomainErrors to appropriate HTTP responses.
 *
 * Registered globally so controllers stay free of try/catch blocks.
 * The mapping below is intentional — add cases as new domain error codes emerge.
 */
let DomainErrorFilter = class DomainErrorFilter {
    catch(error, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const statusMap = {
            JOURNEY_NOT_DRAFT: common_1.HttpStatus.CONFLICT,
            JOURNEY_HAS_NO_TASKS: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            JOURNEY_NOT_PUBLISHED: common_1.HttpStatus.CONFLICT,
            JOURNEY_ARCHIVED: common_1.HttpStatus.CONFLICT,
            TASK_ORDER_INDEX_DUPLICATE: common_1.HttpStatus.CONFLICT,
            TASK_MISSING_RECURRENCE_RULE: common_1.HttpStatus.BAD_REQUEST,
            TASK_UNEXPECTED_RECURRENCE_RULE: common_1.HttpStatus.BAD_REQUEST,
            FEATURE_DISABLED: common_1.HttpStatus.FORBIDDEN,
            UNAUTHORIZED_ACTION: common_1.HttpStatus.FORBIDDEN,
        };
        const statusCode = statusMap[error.code] ?? common_1.HttpStatus.UNPROCESSABLE_ENTITY;
        response.status(statusCode).json({
            statusCode,
            error: error.code,
            message: error.message,
        });
    }
};
exports.DomainErrorFilter = DomainErrorFilter;
exports.DomainErrorFilter = DomainErrorFilter = __decorate([
    (0, common_1.Catch)(domain_error_1.DomainError)
], DomainErrorFilter);
//# sourceMappingURL=domain-error.filter.js.map