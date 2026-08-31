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
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
//# sourceMappingURL=current-user.decorator.d.ts.map