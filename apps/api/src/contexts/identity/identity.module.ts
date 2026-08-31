import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';

// Domain & application
import { SyncProfileOnFirstLoginUseCase } from './application/use-cases/sync-profile-on-first-login.use-case';
import { USER_PROFILE_REPOSITORY } from './application/ports/user-profile.repository';

// Infrastructure
import { UserProfileOrmEntity } from './infrastructure/persistence/user-profile.orm-entity';
import { MikroOrmUserProfileRepository } from './infrastructure/persistence/mikro-orm-user-profile.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { SupabaseAuthGuard } from './infrastructure/auth/supabase-auth.guard';
import { IdentityController } from './infrastructure/http/identity.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MikroOrmModule.forFeature([UserProfileOrmEntity]),
  ],
  providers: [
    // Repository binding — all code depends on the TOKEN, not the class
    {
      provide: USER_PROFILE_REPOSITORY,
      useClass: MikroOrmUserProfileRepository,
    },

    // Use cases
    SyncProfileOnFirstLoginUseCase,

    // Auth infrastructure
    JwtStrategy,

    // Register the guard globally — opt-out per route via @Public()
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
  controllers: [IdentityController],
  // Export so other modules can use @CurrentUser() and the guard
  exports: [USER_PROFILE_REPOSITORY, SyncProfileOnFirstLoginUseCase],
})
export class IdentityModule {}
