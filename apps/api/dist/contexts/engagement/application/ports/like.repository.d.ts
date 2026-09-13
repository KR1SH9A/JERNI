import { Like } from '../../domain/like.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
export interface LikeRepository {
    find(journeyId: JourneyId, userId: UserId): Promise<Like | null>;
    save(like: Like): Promise<void>;
    delete(like: Like): Promise<void>;
}
export declare const LIKE_REPOSITORY: unique symbol;
//# sourceMappingURL=like.repository.d.ts.map