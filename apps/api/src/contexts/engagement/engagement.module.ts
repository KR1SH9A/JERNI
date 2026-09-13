import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { LIKE_REPOSITORY } from './application/ports/like.repository';
import { LikeJourneyUseCase, UnlikeJourneyUseCase } from './application/use-cases/engagement.commands';
import { LikeOrmEntity } from './infrastructure/persistence/like.orm-entity';
import { MikroOrmLikeRepository } from './infrastructure/persistence/mikro-orm-like.repository';
import { EngagementController } from './infrastructure/http/engagement.controller';

@Module({
  imports: [MikroOrmModule.forFeature([LikeOrmEntity])],
  providers: [
    { provide: LIKE_REPOSITORY, useClass: MikroOrmLikeRepository },
    LikeJourneyUseCase,
    UnlikeJourneyUseCase,
  ],
  controllers: [EngagementController],
  exports: [LIKE_REPOSITORY],
})
export class EngagementModule {}
