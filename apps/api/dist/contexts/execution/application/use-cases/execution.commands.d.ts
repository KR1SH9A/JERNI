import { EventBus } from '@nestjs/cqrs';
import { TaskCompletion } from '../../domain/task-completion.aggregate';
import { TaskCompletionRepository } from '../ports/task-completion.repository';
import { MembershipRepository } from '../../../participation/application/ports/membership.repository';
import { JourneyRepository } from '../../../curation/application/ports/journey.repository';
export interface CompleteTaskCommand {
    journeyId: string;
    taskDefinitionId: string;
    userId: string;
}
export declare class CompleteTaskUseCase {
    private readonly journeyRepo;
    private readonly membershipRepo;
    private readonly completionRepo;
    private readonly eventBus;
    constructor(journeyRepo: JourneyRepository, membershipRepo: MembershipRepository, completionRepo: TaskCompletionRepository, eventBus: EventBus);
    execute(cmd: CompleteTaskCommand): Promise<TaskCompletion>;
}
export interface UncompleteTaskCommand {
    journeyId: string;
    taskDefinitionId: string;
    userId: string;
}
export declare class UncompleteTaskUseCase {
    private readonly membershipRepo;
    private readonly completionRepo;
    private readonly eventBus;
    constructor(membershipRepo: MembershipRepository, completionRepo: TaskCompletionRepository, eventBus: EventBus);
    execute(cmd: UncompleteTaskCommand): Promise<void>;
}
//# sourceMappingURL=execution.commands.d.ts.map