import { EventBus } from '@nestjs/cqrs';
import { Membership } from '../../domain/membership.aggregate';
import { MembershipRepository } from '../ports/membership.repository';
import { JourneyRepository } from '../../../curation/application/ports/journey.repository';
export interface JoinJourneyCommand {
    journeyId: string;
    userId: string;
}
export declare class JoinJourneyUseCase {
    private readonly journeyRepo;
    private readonly membershipRepo;
    private readonly eventBus;
    constructor(journeyRepo: JourneyRepository, membershipRepo: MembershipRepository, eventBus: EventBus);
    execute(cmd: JoinJourneyCommand): Promise<Membership>;
}
export interface LeaveJourneyCommand {
    journeyId: string;
    userId: string;
}
export declare class LeaveJourneyUseCase {
    private readonly membershipRepo;
    private readonly eventBus;
    constructor(membershipRepo: MembershipRepository, eventBus: EventBus);
    execute(cmd: LeaveJourneyCommand): Promise<void>;
}
//# sourceMappingURL=participation.commands.d.ts.map