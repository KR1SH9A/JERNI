import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';

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
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser;
  },
);
