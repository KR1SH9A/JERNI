import { JourneyRepository } from '../ports/journey.repository';
export interface DiscoverFeedQuery {
    tags?: string[];
    search?: string;
    page?: number;
    pageSize?: number;
}
export interface DiscoverFeedResult {
    journeys: JourneyReadModel[];
    total: number;
    page: number;
    pageSize: number;
}
export interface JourneyReadModel {
    id: string;
    curatorId: string;
    title: string;
    description: string;
    tags: string[];
    status: string;
    visibility: string;
    coverProvider: string | null;
    coverAssetId: string | null;
    likeCount: number;
    taskCount: number;
    createdAt: Date;
}
export declare class GetDiscoverFeedQuery {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    execute(query: DiscoverFeedQuery): Promise<DiscoverFeedResult>;
    private toReadModel;
}
export interface JourneyDetailReadModel extends JourneyReadModel {
    tasks: {
        id: string;
        title: string;
        orderIndex: number;
        kind: string;
        recurrenceRule: string | null;
    }[];
}
export declare class GetJourneyDetailQuery {
    private readonly journeyRepo;
    constructor(journeyRepo: JourneyRepository);
    execute(journeyId: string): Promise<JourneyDetailReadModel>;
}
//# sourceMappingURL=journey.queries.d.ts.map