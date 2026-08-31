import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import { CreateJourneyUseCase, AddTaskDefinitionUseCase, PublishJourneyUseCase } from '../../application/use-cases/journey.commands';
import { GetDiscoverFeedQuery, GetJourneyDetailQuery } from '../../application/use-cases/journey.queries';
import { CreateJourneyDto, AddTaskDto } from './curation.dto';
export declare class CurationController {
    private readonly createJourney;
    private readonly addTask;
    private readonly publishJourney;
    private readonly discoverFeed;
    private readonly journeyDetail;
    constructor(createJourney: CreateJourneyUseCase, addTask: AddTaskDefinitionUseCase, publishJourney: PublishJourneyUseCase, discoverFeed: GetDiscoverFeedQuery, journeyDetail: GetJourneyDetailQuery);
    /**
     * GET /journeys — Discover feed (public, no auth required).
     * Returns paginated list of published public journeys.
     */
    discover(page?: number, pageSize?: number, tags?: string[], search?: string): Promise<import("../../application/use-cases/journey.queries").DiscoverFeedResult>;
    /**
     * GET /journeys/:id — Journey detail (public, no auth required for public journeys).
     */
    getDetail(id: string): Promise<import("../../application/use-cases/journey.queries").JourneyDetailReadModel>;
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
}
//# sourceMappingURL=curation.controller.d.ts.map