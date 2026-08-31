import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { SyncProfileOnFirstLoginUseCase } from '../../application/use-cases/sync-profile-on-first-login.use-case';

export interface JwtPayload {
  sub: string;          // Supabase user id (auth.uid())
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
  aud: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * JwtStrategy — validates Supabase-issued JWTs using Supabase's JWKS endpoint.
 *
 * Key design decisions:
 *  1. jwks-rsa fetches and caches the public keys — no hardcoded secrets.
 *  2. On valid JWT, we call SyncProfileOnFirstLoginUseCase so every authenticated
 *     user automatically has a profile row, without a separate "register" step.
 *  3. The returned object is injected as request.user — always use @CurrentUser()
 *     in controllers, never request.user directly.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly syncProfile: SyncProfileOnFirstLoginUseCase,
  ) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL env var is required for JWT verification');
    }

    super({
      // Extract Bearer token from Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Verify against Supabase's published JWKS — no hardcoded secrets
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      // Supabase tokens are issued for the "authenticated" audience
      audience: 'authenticated',
      issuer: `${supabaseUrl}/auth/v1`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Sync profile on first login (idempotent — noop if profile already exists)
    await this.syncProfile.execute({
      userId: payload.sub,
      email: payload.email,
      displayName:
        payload.user_metadata?.full_name ??
        payload.user_metadata?.name,
    });

    return { id: payload.sub, email: payload.email };
  }
}
