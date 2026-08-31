"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const nestjs_1 = require("@mikro-orm/nestjs");
// Domain & application
const sync_profile_on_first_login_use_case_1 = require("./application/use-cases/sync-profile-on-first-login.use-case");
const user_profile_repository_1 = require("./application/ports/user-profile.repository");
// Infrastructure
const user_profile_orm_entity_1 = require("./infrastructure/persistence/user-profile.orm-entity");
const mikro_orm_user_profile_repository_1 = require("./infrastructure/persistence/mikro-orm-user-profile.repository");
const jwt_strategy_1 = require("./infrastructure/auth/jwt.strategy");
const supabase_auth_guard_1 = require("./infrastructure/auth/supabase-auth.guard");
const identity_controller_1 = require("./infrastructure/http/identity.controller");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            nestjs_1.MikroOrmModule.forFeature([user_profile_orm_entity_1.UserProfileOrmEntity]),
        ],
        providers: [
            // Repository binding — all code depends on the TOKEN, not the class
            {
                provide: user_profile_repository_1.USER_PROFILE_REPOSITORY,
                useClass: mikro_orm_user_profile_repository_1.MikroOrmUserProfileRepository,
            },
            // Use cases
            sync_profile_on_first_login_use_case_1.SyncProfileOnFirstLoginUseCase,
            // Auth infrastructure
            jwt_strategy_1.JwtStrategy,
            // Register the guard globally — opt-out per route via @Public()
            {
                provide: core_1.APP_GUARD,
                useClass: supabase_auth_guard_1.SupabaseAuthGuard,
            },
        ],
        controllers: [identity_controller_1.IdentityController],
        // Export so other modules can use @CurrentUser() and the guard
        exports: [user_profile_repository_1.USER_PROFILE_REPOSITORY, sync_profile_on_first_login_use_case_1.SyncProfileOnFirstLoginUseCase],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map