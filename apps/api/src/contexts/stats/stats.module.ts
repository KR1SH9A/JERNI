import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { DailyStatOrmEntity } from './infrastructure/persistence/daily-stat.orm-entity';
import { AllTimeStatOrmEntity } from './infrastructure/persistence/all-time-stat.orm-entity';
import { MikroOrmStatsRepository } from './infrastructure/persistence/mikro-orm-stats.repository';
import { TaskCompletedHandler } from './application/event-handlers/task-completed.handler';
import { TaskUncompletedHandler } from './application/event-handlers/task-uncompleted.handler';
import { GetJourneyStatsQuery } from './application/use-cases/stats.queries';
import { StatsController } from './infrastructure/http/stats.controller';
import { STATS_REPOSITORY } from './application/ports/stats.repository';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([DailyStatOrmEntity, AllTimeStatOrmEntity]),
  ],
  controllers: [StatsController],
  providers: [
    // Repository binding
    {
      provide: STATS_REPOSITORY,
      useClass: MikroOrmStatsRepository,
    },
    // Event handlers
    TaskCompletedHandler,
    TaskUncompletedHandler,
    // Queries
    GetJourneyStatsQuery,
  ],
})
export class StatsModule {}
