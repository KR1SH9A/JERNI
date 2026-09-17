import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { JOURNEY_REPOSITORY } from './application/ports/journey.repository';
import {
  CreateJourneyUseCase,
  AddTaskDefinitionUseCase,
  PublishJourneyUseCase,
  UpdateJourneyUseCase,
  ArchiveJourneyUseCase,
} from './application/use-cases/journey.commands';
import { GetDiscoverFeedQuery, GetJourneyDetailQuery, GetMyJourneysQuery } from './application/use-cases/journey.queries';
import { LikeCountProjection } from './application/event-handlers/like-count.projection';
import { JourneyOrmEntity } from './infrastructure/persistence/journey.orm-entity';
import { TaskDefinitionOrmEntity } from './infrastructure/persistence/task-definition.orm-entity';
import { MikroOrmJourneyRepository } from './infrastructure/persistence/mikro-orm-journey.repository';
import { CurationController } from './infrastructure/http/curation.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([JourneyOrmEntity, TaskDefinitionOrmEntity]),
  ],
  providers: [
    { provide: JOURNEY_REPOSITORY, useClass: MikroOrmJourneyRepository },
    CreateJourneyUseCase,
    AddTaskDefinitionUseCase,
    PublishJourneyUseCase,
    UpdateJourneyUseCase,
    ArchiveJourneyUseCase,
    GetDiscoverFeedQuery,
    GetJourneyDetailQuery,
    GetMyJourneysQuery,
    // Event handler: keeps denormalized likeCount in sync when Engagement fires
    LikeCountProjection,
  ],
  controllers: [CurationController],
  exports: [JOURNEY_REPOSITORY, GetJourneyDetailQuery],
})
export class CurationModule {}
