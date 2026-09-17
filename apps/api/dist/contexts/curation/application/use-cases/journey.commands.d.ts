import { Journey, JourneyVisibility } from '../../domain/journey.aggregate';
import { TaskKind, RecurrenceRule } from '../../domain/task-definition.entity';
import { JourneyRepository } from '../ports/journey.repository';
export interface CreateJourneyCommand {
    curatorId: string;
    title: string;
    description?: string;
    tags?: string[];
    visibility?: JourneyVisibility;
}
export declare class CreateJourneyUseCase {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    execute(cmd: CreateJourneyCommand): Promise<Journey>;
}
export interface AddTaskDefinitionCommand {
    journeyId: string;
    requestedBy: string;
    title: string;
    kind: TaskKind;
    recurrenceRule?: RecurrenceRule;
}
export declare class AddTaskDefinitionUseCase {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    execute(cmd: AddTaskDefinitionCommand): Promise<Journey>;
}
export interface PublishJourneyCommand {
    journeyId: string;
    requestedBy: string;
}
export declare class PublishJourneyUseCase {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    execute(cmd: PublishJourneyCommand): Promise<Journey>;
}
export interface UpdateJourneyCommand {
    journeyId: string;
    requestedBy: string;
    title?: string;
    description?: string;
    tags?: string[];
    visibility?: JourneyVisibility;
}
export declare class UpdateJourneyUseCase {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    execute(cmd: UpdateJourneyCommand): Promise<Journey>;
}
export interface ArchiveJourneyCommand {
    journeyId: string;
    requestedBy: string;
}
export declare class ArchiveJourneyUseCase {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    execute(cmd: ArchiveJourneyCommand): Promise<Journey>;
}
//# sourceMappingURL=journey.commands.d.ts.map