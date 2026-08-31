import { Strategy } from 'passport-jwt';
import { SyncProfileOnFirstLoginUseCase } from '../../application/use-cases/sync-profile-on-first-login.use-case';
export interface JwtPayload {
    sub: string;
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
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
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
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly syncProfile;
    constructor(syncProfile: SyncProfileOnFirstLoginUseCase);
    validate(payload: JwtPayload): Promise<AuthenticatedUser>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map