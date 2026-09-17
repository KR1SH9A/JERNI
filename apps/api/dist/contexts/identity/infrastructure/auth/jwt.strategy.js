"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const sync_profile_on_first_login_use_case_1 = require("../../application/use-cases/sync-profile-on-first-login.use-case");
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
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    syncProfile;
    constructor(syncProfile) {
        const supabaseUrl = process.env.SUPABASE_URL;
        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL env var is required for JWT verification');
        }
        super({
            // Extract Bearer token from Authorization header
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            // Verify against Supabase's published JWKS — no hardcoded secrets
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
            }),
            // Supabase tokens are issued for the "authenticated" audience
            audience: 'authenticated',
            issuer: `${supabaseUrl}/auth/v1`,
            algorithms: ['RS256', 'ES256'],
        });
        this.syncProfile = syncProfile;
    }
    async validate(payload) {
        // Sync profile on first login (idempotent — noop if profile already exists)
        await this.syncProfile.execute({
            userId: payload.sub,
            email: payload.email,
            displayName: payload.user_metadata?.full_name ??
                payload.user_metadata?.name,
        });
        return { id: payload.sub, email: payload.email };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sync_profile_on_first_login_use_case_1.SyncProfileOnFirstLoginUseCase])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map