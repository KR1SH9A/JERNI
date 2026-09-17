import { Journey } from '../../domain/journey.aggregate';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
export interface JourneyFilters {
    status?: string;
    curatorId?: string;
    tags?: string[];
    search?: string;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface JourneyRepository {
    findById(id: JourneyId): Promise<Journey | null>;
    findPublicPublished(filters: JourneyFilters, page: number, pageSize: number): Promise<PaginatedResult<Journey>>;
    findByCuratorId(curatorId: string): Promise<{
        journey: Journey;
        memberCount: number;
    }[]>;
    save(journey: Journey): Promise<void>;
    nextOrderIndex(journeyId: JourneyId): Promise<number>;
}
export declare const JOURNEY_REPOSITORY: unique symbol;
//# sourceMappingURL=journey.repository.d.ts.map