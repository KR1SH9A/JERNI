import { EventBus } from '@nestjs/cqrs';
import { LikeRepository } from '../ports/like.repository';
export interface LikeJourneyCommand {
    journeyId: string;
    userId: string;
}
export declare class LikeJourneyUseCase {
    private readonly likeRepo;
    private readonly eventBus;
    constructor(likeRepo: LikeRepository, eventBus: EventBus);
    execute(cmd: LikeJourneyCommand): Promise<void>;
}
export interface UnlikeJourneyCommand {
    journeyId: string;
    userId: string;
}
export declare class UnlikeJourneyUseCase {
    private readonly likeRepo;
    private readonly eventBus;
    constructor(likeRepo: LikeRepository, eventBus: EventBus);
    execute(cmd: UnlikeJourneyCommand): Promise<void>;
}
//# sourceMappingURL=engagement.commands.d.ts.map