import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { CreateJourneyUseCase, AddTaskDefinitionUseCase, PublishJourneyUseCase, UpdateJourneyUseCase, ArchiveJourneyUseCase } from '../../application/use-cases/journey.commands';
import { GetDiscoverFeedQuery, GetJourneyDetailQuery, GetMyJourneysQuery } from '../../application/use-cases/journey.queries';
import { CreateJourneyDto, AddTaskDto, UpdateJourneyDto } from './curation.dto';
export declare class CurationController {
    private readonly createJourney;
    private readonly addTask;
    private readonly publishJourney;
    private readonly updateJourney;
    private readonly archiveJourney;
    private readonly discoverFeed;
    private readonly journeyDetail;
    private readonly myJourneys;
    constructor(createJourney: CreateJourneyUseCase, addTask: AddTaskDefinitionUseCase, publishJourney: PublishJourneyUseCase, updateJourney: UpdateJourneyUseCase, archiveJourney: ArchiveJourneyUseCase, discoverFeed: GetDiscoverFeedQuery, journeyDetail: GetJourneyDetailQuery, myJourneys: GetMyJourneysQuery);
    /**
     * GET /journeys — Discover feed (public, no auth required).
     */
    discover(page?: number, pageSize?: number, tags?: string[], search?: string): Promise<import("../../application/use-cases/journey.queries").DiscoverFeedResult>;
    /**
     * GET /journeys/:id — Journey detail (public, no auth required for public journeys).
     */
    getDetail(id: string): Promise<import("../../application/use-cases/journey.queries").JourneyDetailReadModel>;
    /**
     * GET /journeys/mine — Curator's own journeys (all statuses) with live member count.
     *
     * NOTE: this must be defined BEFORE :id routes or NestJS will try to parse
     * 'mine' as a UUID and fail. Order matters in NestJS route resolution.
     */
    getMine(user: AuthenticatedUser): Promise<import("../../application/use-cases/journey.queries").MyJourneysResult>;
    /**
     * POST /journeys — Curator creates a new journey.
     */
    create(user: AuthenticatedUser, dto: CreateJourneyDto): Promise<{
        id: string;
        status: import("../../domain/journey.aggregate").JourneyStatus;
    }>;
    /**
     * POST /journeys/:id/tasks — Curator adds a task to a journey.
     */
    addTaskToJourney(journeyId: string, user: AuthenticatedUser, dto: AddTaskDto): Promise<{
        journeyId: string;
        taskCount: number;
    }>;
    /**
     * PATCH /journeys/:id/publish — Curator publishes a draft journey.
     */
    publish(journeyId: string, user: AuthenticatedUser): Promise<{
        id: string;
        status: import("../../domain/journey.aggregate").JourneyStatus;
    }>;
    /**
     * PATCH /journeys/:id — Curator edits a DRAFT journey's metadata.
     */
    update(journeyId: string, user: AuthenticatedUser, dto: UpdateJourneyDto): Promise<{
        id: string;
        status: import("../../domain/journey.aggregate").JourneyStatus;
        updatedAt: Date;
    }>;
    /**
     * POST /journeys/:id/archive — Curator archives a PUBLISHED journey.
     */
    archive(journeyId: string, user: AuthenticatedUser): Promise<{
        id: string;
        status: import("../../domain/journey.aggregate").JourneyStatus;
    }>;
}
//# sourceMappingURL=curation.controller.d.ts.map