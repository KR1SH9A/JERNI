import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CurationModule } from '../curation/curation.module';

import { MEMBERSHIP_REPOSITORY } from './application/ports/membership.repository';
import { JoinJourneyUseCase, LeaveJourneyUseCase } from './application/use-cases/participation.commands';
import { GetMembershipStatusQuery } from './application/use-cases/participation.queries';
import { MembershipOrmEntity } from './infrastructure/persistence/membership.orm-entity';
import { MikroOrmMembershipRepository } from './infrastructure/persistence/mikro-orm-membership.repository';
import { ParticipationController } from './infrastructure/http/participation.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([MembershipOrmEntity]),
    // Imports JOURNEY_REPOSITORY token to guard joinability
    CurationModule,
  ],
  providers: [
    { provide: MEMBERSHIP_REPOSITORY, useClass: MikroOrmMembershipRepository },
    JoinJourneyUseCase,
    LeaveJourneyUseCase,
    GetMembershipStatusQuery,
  ],
  controllers: [ParticipationController],
  // Export repo + query so ExecutionModule can verify membership before task completion
  exports: [MEMBERSHIP_REPOSITORY, GetMembershipStatusQuery],
})
export class ParticipationModule {}
