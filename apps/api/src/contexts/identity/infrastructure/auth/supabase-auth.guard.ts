import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * SupabaseAuthGuard — applied globally via APP_GUARD.
 *
 * Routes can opt out with @Public() (only for truly unauthenticated paths like
 * the discover feed). Every other route is guarded by default.
 *
 * The actual JWT verification is in the JwtStrategy (passport-jwt + JWKS).
 */
@Injectable()
export class SupabaseAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route or controller is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException(
        'Invalid or missing authentication token. ' +
        'Include a valid Supabase session JWT in the Authorization header.',
      );
    }
    return user;
  }
}
