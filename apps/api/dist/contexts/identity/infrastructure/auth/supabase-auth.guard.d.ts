import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const SupabaseAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
/**
 * SupabaseAuthGuard — applied globally via APP_GUARD.
 *
 * Routes can opt out with @Public() (only for truly unauthenticated paths like
 * the discover feed). Every other route is guarded by default.
 *
 * The actual JWT verification is in the JwtStrategy (passport-jwt + JWKS).
 */
export declare class SupabaseAuthGuard extends SupabaseAuthGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest<TUser>(err: unknown, user: TUser): TUser;
}
export {};
//# sourceMappingURL=supabase-auth.guard.d.ts.map