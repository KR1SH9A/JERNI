import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';

// Contexts
import { IdentityModule } from './contexts/identity/identity.module';
import { CurationModule } from './contexts/curation/curation.module';
import { MediaModule } from './contexts/media/media.module';
import { ParticipationModule } from './contexts/participation/participation.module';
import { EngagementModule } from './contexts/engagement/engagement.module';
import { ExecutionModule } from './contexts/execution/execution.module';

// Shared infra
import { mikroOrmConfig } from './shared-kernel/database/mikro-orm.config';

@Module({
  imports: [
    // Config: loads .env, validates required vars
    ConfigModule.forRoot({ isGlobal: true }),

    // Database: MikroORM connected to Supabase Postgres
    MikroOrmModule.forRootAsync({
      useFactory: () => mikroOrmConfig(),
    }),

    // CQRS EventBus — in-process pub/sub for domain events
    CqrsModule.forRoot(),

    // Rate limiting — applied per-controller via @Throttle() or globally
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Bounded-context modules
    IdentityModule,
    CurationModule,
    MediaModule,
    ParticipationModule,
    EngagementModule,
    ExecutionModule,
  ],
})
export class AppModule {}

