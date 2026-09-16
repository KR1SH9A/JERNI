import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../../identity/infrastructure/decorators/public.decorator';
import { CurrentUser } from '../../../identity/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/auth/jwt.strategy';
import {
  CreateJourneyUseCase,
  AddTaskDefinitionUseCase,
  PublishJourneyUseCase,
  UpdateJourneyUseCase,
  ArchiveJourneyUseCase,
} from '../../application/use-cases/journey.commands';
import {
  GetDiscoverFeedQuery,
  GetJourneyDetailQuery,
  GetMyJourneysQuery,
} from '../../application/use-cases/journey.queries';
import { CreateJourneyDto, AddTaskDto, UpdateJourneyDto } from './curation.dto';

@ApiTags('Journeys')
@Controller('journeys')
export class CurationController {
  constructor(
    private readonly createJourney: CreateJourneyUseCase,
    private readonly addTask: AddTaskDefinitionUseCase,
    private readonly publishJourney: PublishJourneyUseCase,
    private readonly updateJourney: UpdateJourneyUseCase,
    private readonly archiveJourney: ArchiveJourneyUseCase,
    private readonly discoverFeed: GetDiscoverFeedQuery,
    private readonly journeyDetail: GetJourneyDetailQuery,
    private readonly myJourneys: GetMyJourneysQuery,
  ) {}

  // ── Public routes ────────────────────────────────────────────────────────

  /**
   * GET /journeys — Discover feed (public, no auth required).
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Discover feed — public published journeys' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async discover(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('tags') tags?: string[],
    @Query('search') search?: string,
  ) {
    return this.discoverFeed.execute({ page, pageSize, tags, search });
  }

  /**
   * GET /journeys/:id — Journey detail (public, no auth required for public journeys).
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get journey detail with tasks' })
  async getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.journeyDetail.execute(id);
  }

  // ── Authenticated routes ─────────────────────────────────────────────────

  /**
   * GET /journeys/mine — Curator's own journeys (all statuses) with live member count.
   *
   * NOTE: this must be defined BEFORE :id routes or NestJS will try to parse
   * 'mine' as a UUID and fail. Order matters in NestJS route resolution.
   */
  @Get('mine')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's journeys as curator" })
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.myJourneys.execute(user.id);
  }

  /**
   * POST /journeys — Curator creates a new journey.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new journey (curator only)' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateJourneyDto,
  ) {
    const journey = await this.createJourney.execute({
      curatorId: user.id,
      ...dto,
    });
    return { id: journey.id.value, status: journey.status };
  }

  /**
   * POST /journeys/:id/tasks — Curator adds a task to a journey.
   */
  @Post(':id/tasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a task to a journey (curator only)' })
  async addTaskToJourney(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddTaskDto,
  ) {
    const journey = await this.addTask.execute({
      journeyId,
      requestedBy: user.id,
      ...dto,
    });
    return {
      journeyId: journey.id.value,
      taskCount: journey.taskDefinitions.length,
    };
  }

  /**
   * PATCH /journeys/:id/publish — Curator publishes a draft journey.
   */
  @Patch(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a draft journey (curator only)' })
  async publish(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const journey = await this.publishJourney.execute({
      journeyId,
      requestedBy: user.id,
    });
    return { id: journey.id.value, status: journey.status };
  }

  /**
   * PATCH /journeys/:id — Curator edits a DRAFT journey's metadata.
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a DRAFT journey (curator only, DRAFT journeys only)' })
  async update(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateJourneyDto,
  ) {
    const journey = await this.updateJourney.execute({
      journeyId,
      requestedBy: user.id,
      ...dto,
    });
    return { id: journey.id.value, status: journey.status, updatedAt: journey.updatedAt };
  }

  /**
   * POST /journeys/:id/archive — Curator archives a PUBLISHED journey.
   */
  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a published journey (curator only)' })
  async archive(
    @Param('id', ParseUUIDPipe) journeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const journey = await this.archiveJourney.execute({
      journeyId,
      requestedBy: user.id,
    });
    return { id: journey.id.value, status: journey.status };
  }
}
