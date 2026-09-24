import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JourneyRepository, JOURNEY_REPOSITORY } from '../ports/journey.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { Journey } from '../../domain/journey.aggregate';

// ─── DiscoverFeed query ─────────────────────────────────────────────────────

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
  memberCount?: number;
  createdAt: Date;
}

@Injectable()
export class GetDiscoverFeedQuery {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(query: DiscoverFeedQuery): Promise<DiscoverFeedResult> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 50); // cap at 50

    const result = await this.journeyRepo.findPublicPublished(
      { tags: query.tags, search: query.search },
      page,
      pageSize,
    );

    return {
      journeys: result.data.map((item) => ({
        ...this.toReadModel(item.journey),
        memberCount: item.memberCount,
      })),
      total: result.total,
      page,
      pageSize,
    };
  }

  private toReadModel(j: Journey): JourneyReadModel {
    return {
      id: j.id.value,
      curatorId: j.curatorId.value,
      title: j.title,
      description: j.description,
      tags: j.tags,
      status: j.status,
      visibility: j.visibility,
      coverProvider: j.coverProvider,
      coverAssetId: j.coverAssetId,
      likeCount: j.likeCount,
      taskCount: j.taskDefinitions.length,
      createdAt: j.createdAt,
    };
  }
}

// ─── GetJourneyDetail query ─────────────────────────────────────────────────

export interface JourneyDetailReadModel extends JourneyReadModel {
  tasks: {
    id: string;
    title: string;
    orderIndex: number;
    kind: string;
    recurrenceRule: string | null;
  }[];
}

@Injectable()
export class GetJourneyDetailQuery {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(journeyId: string): Promise<JourneyDetailReadModel> {
    const journey = await this.journeyRepo.findById(JourneyId.of(journeyId));
    if (!journey) {
      throw new NotFoundException(`Journey ${journeyId} not found`);
    }

    return {
      id: journey.id.value,
      curatorId: journey.curatorId.value,
      title: journey.title,
      description: journey.description,
      tags: journey.tags,
      status: journey.status,
      visibility: journey.visibility,
      coverProvider: journey.coverProvider,
      coverAssetId: journey.coverAssetId,
      likeCount: journey.likeCount,
      taskCount: journey.taskDefinitions.length,
      createdAt: journey.createdAt,
      tasks: journey.taskDefinitions.map((t) => ({
        id: t.id,
        title: t.title,
        orderIndex: t.orderIndex,
        kind: t.kind,
        recurrenceRule: t.recurrenceRule,
      })),
    };
  }
}

// ─── GetMyJourneys query ────────────────────────────────────────────────────

export interface CuratorJourneyReadModel extends JourneyReadModel {
  memberCount: number;
}

export interface MyJourneysResult {
  journeys: CuratorJourneyReadModel[];
  total: number;
}

@Injectable()
export class GetMyJourneysQuery {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(curatorId: string): Promise<MyJourneysResult> {
    const result = await this.journeyRepo.findByCuratorId(curatorId);
    return {
      journeys: result.map((item) => ({
        ...this.toReadModel(item.journey),
        memberCount: item.memberCount,
      })),
      total: result.length,
    };
  }

  private toReadModel(j: Journey): JourneyReadModel {
    return {
      id: j.id.value,
      curatorId: j.curatorId.value,
      title: j.title,
      description: j.description,
      tags: j.tags,
      status: j.status,
      visibility: j.visibility,
      coverProvider: j.coverProvider,
      coverAssetId: j.coverAssetId,
      likeCount: j.likeCount,
      taskCount: j.taskDefinitions.length,
      createdAt: j.createdAt,
    };
  }
}
