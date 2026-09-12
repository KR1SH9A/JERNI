import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CurationModule } from '../curation/curation.module';
import { ParticipationModule } from '../participation/participation.module';

import { TASK_COMPLETION_REPOSITORY } from './application/ports/task-completion.repository';
import { CompleteTaskUseCase, UncompleteTaskUseCase } from './application/use-cases/execution.commands';
import { GetMyProgressQuery } from './application/use-cases/execution.queries';
import { TaskCompletionOrmEntity } from './infrastructure/persistence/task-completion.orm-entity';
import { MikroOrmTaskCompletionRepository } from './infrastructure/persistence/mikro-orm-task-completion.repository';
import { ExecutionController } from './infrastructure/http/execution.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([TaskCompletionOrmEntity]),
    // JOURNEY_REPOSITORY: to verify journey is PUBLISHED and find task definitions
    CurationModule,
    // MEMBERSHIP_REPOSITORY: to guard that the user is an active member before completing
    ParticipationModule,
  ],
  providers: [
    { provide: TASK_COMPLETION_REPOSITORY, useClass: MikroOrmTaskCompletionRepository },
    CompleteTaskUseCase,
    UncompleteTaskUseCase,
    GetMyProgressQuery,
  ],
  controllers: [ExecutionController],
  exports: [TASK_COMPLETION_REPOSITORY, GetMyProgressQuery],
})
export class ExecutionModule {}
