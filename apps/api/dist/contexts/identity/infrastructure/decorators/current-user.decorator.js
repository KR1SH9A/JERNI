"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
/**
 * @CurrentUser() — injects the authenticated user object into a controller parameter.
 *
 * Usage:
 *   @Get('me')
 *   getMe(@CurrentUser() user: AuthenticatedUser) { ... }
 *
 * The value is set by JwtStrategy.validate() after JWT verification.
 * NEVER read request.user directly in a controller — always use this decorator.
 */
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
//# sourceMappingURL=current-user.decorator.js.map