import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Journey, JourneyVisibility } from '../../domain/journey.aggregate';
import { TaskDefinition, TaskKind, RecurrenceRule } from '../../domain/task-definition.entity';
import { JourneyRepository, JOURNEY_REPOSITORY } from '../ports/journey.repository';
import { JourneyId } from '../../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../../shared-kernel/value-objects/user-id.vo';
import { DomainError } from '../../../../shared-kernel/errors/domain.error';

// ─── CreateJourney ─────────────────────────────────────────────────────────

export interface CreateJourneyCommand {
  curatorId: string;
  title: string;
  description?: string;
  tags?: string[];
  visibility?: JourneyVisibility;
}

@Injectable()
export class CreateJourneyUseCase {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(cmd: CreateJourneyCommand): Promise<Journey> {
    const journey = new Journey({
      id: JourneyId.of(randomUUID()),
      curatorId: UserId.of(cmd.curatorId),
      title: cmd.title,
      description: cmd.description,
      tags: cmd.tags,
      visibility: cmd.visibility ?? 'PUBLIC',
      status: 'DRAFT',
    });

    await this.journeyRepo.save(journey);
    return journey;
  }
}

// ─── AddTaskDefinition ─────────────────────────────────────────────────────

export interface AddTaskDefinitionCommand {
  journeyId: string;
  requestedBy: string;
  title: string;
  kind: TaskKind;
  recurrenceRule?: RecurrenceRule;
}

@Injectable()
export class AddTaskDefinitionUseCase {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(cmd: AddTaskDefinitionCommand): Promise<Journey> {
    const journey = await this.journeyRepo.findById(JourneyId.of(cmd.journeyId));
    if (!journey) {
      throw new NotFoundException(`Journey ${cmd.journeyId} not found`);
    }

    // Authorization: only the curator can add tasks
    if (!journey.isCurator(UserId.of(cmd.requestedBy))) {
      throw new DomainError(
        'Only the curator can add tasks to this journey.',
        'UNAUTHORIZED_ACTION',
      );
    }

    // Get the next available orderIndex (repository helper)
    const nextIndex = await this.journeyRepo.nextOrderIndex(JourneyId.of(cmd.journeyId));

    const task = new TaskDefinition({
      id: randomUUID(),
      journeyId: cmd.journeyId,
      title: cmd.title,
      orderIndex: nextIndex,
      kind: cmd.kind,
      recurrenceRule: cmd.recurrenceRule,
    });

    // addTask() enforces all domain invariants (archived check, orderIndex uniqueness)
    journey.addTask(task);
    await this.journeyRepo.save(journey);
    return journey;
  }
}

// ─── PublishJourney ─────────────────────────────────────────────────────────

export interface PublishJourneyCommand {
  journeyId: string;
  requestedBy: string;
}

@Injectable()
export class PublishJourneyUseCase {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(cmd: PublishJourneyCommand): Promise<Journey> {
    const journey = await this.journeyRepo.findById(JourneyId.of(cmd.journeyId));
    if (!journey) {
      throw new NotFoundException(`Journey ${cmd.journeyId} not found`);
    }

    if (!journey.isCurator(UserId.of(cmd.requestedBy))) {
      throw new DomainError(
        'Only the curator can publish this journey.',
        'UNAUTHORIZED_ACTION',
      );
    }

    // publish() enforces: must be DRAFT, must have tasks
    journey.publish();
    await this.journeyRepo.save(journey);
    return journey;
  }
}

// ─── UpdateJourney ─────────────────────────────────────────────────────────

export interface UpdateJourneyCommand {
  journeyId: string;
  requestedBy: string;
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: JourneyVisibility;
}

@Injectable()
export class UpdateJourneyUseCase {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(cmd: UpdateJourneyCommand): Promise<Journey> {
    const journey = await this.journeyRepo.findById(JourneyId.of(cmd.journeyId));
    if (!journey) {
      throw new NotFoundException(`Journey ${cmd.journeyId} not found`);
    }

    if (!journey.isCurator(UserId.of(cmd.requestedBy))) {
      throw new DomainError('Only the curator can edit this journey.', 'UNAUTHORIZED_ACTION');
    }

    if (journey.status !== 'DRAFT') {
      throw new DomainError(
        `Only DRAFT journeys can be edited. Current status: ${journey.status}.`,
        'JOURNEY_NOT_DRAFT',
      );
    }

    // Apply only supplied fields
    if (cmd.title !== undefined) journey.title = cmd.title;
    if (cmd.description !== undefined) journey.description = cmd.description;
    if (cmd.tags !== undefined) journey.tags = cmd.tags;
    if (cmd.visibility !== undefined) journey.visibility = cmd.visibility;
    journey.updatedAt = new Date();

    await this.journeyRepo.save(journey);
    return journey;
  }
}

// ─── ArchiveJourney ────────────────────────────────────────────────────────

export interface ArchiveJourneyCommand {
  journeyId: string;
  requestedBy: string;
}

@Injectable()
export class ArchiveJourneyUseCase {
  constructor(
    @Inject(JOURNEY_REPOSITORY)
    private readonly journeyRepo: JourneyRepository,
  ) {}

  async execute(cmd: ArchiveJourneyCommand): Promise<Journey> {
    const journey = await this.journeyRepo.findById(JourneyId.of(cmd.journeyId));
    if (!journey) {
      throw new NotFoundException(`Journey ${cmd.journeyId} not found`);
    }

    if (!journey.isCurator(UserId.of(cmd.requestedBy))) {
      throw new DomainError('Only the curator can archive this journey.', 'UNAUTHORIZED_ACTION');
    }

    // archive() enforces: must be PUBLISHED
    journey.archive();
    await this.journeyRepo.save(journey);
    return journey;
  }
}
