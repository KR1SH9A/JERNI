import { JourneyId } from '../../../shared-kernel/value-objects/journey-id.vo';
import { UserId } from '../../../shared-kernel/value-objects/user-id.vo';
import { TaskDefinition, TaskKind } from './task-definition.entity';
import { DomainError } from '../../../shared-kernel/errors/domain.error';

export type JourneyVisibility = 'PUBLIC' | 'PRIVATE';
export type JourneyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/**
 * Journey — Aggregate Root for the Curation bounded context.
 *
 * All state changes go through methods on this class.
 * Invariants are enforced HERE, not in application services or controllers.
 */
export class Journey {
  readonly id: JourneyId;
  readonly curatorId: UserId;
  title: string;
  description: string;
  tags: string[];
  visibility: JourneyVisibility;
  status: JourneyStatus;
  coverProvider: string | null;
  coverAssetId: string | null;
  likeCount: number;
  readonly createdAt: Date;
  updatedAt: Date;

  private _taskDefinitions: TaskDefinition[];

  constructor(props: {
    id: JourneyId;
    curatorId: UserId;
    title: string;
    description?: string;
    tags?: string[];
    visibility?: JourneyVisibility;
    status?: JourneyStatus;
    coverProvider?: string | null;
    coverAssetId?: string | null;
    likeCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    taskDefinitions?: TaskDefinition[];
  }) {
    this.id = props.id;
    this.curatorId = props.curatorId;
    this.title = props.title;
    this.description = props.description ?? '';
    this.tags = props.tags ?? [];
    this.visibility = props.visibility ?? 'PUBLIC';
    this.status = props.status ?? 'DRAFT';
    this.coverProvider = props.coverProvider ?? null;
    this.coverAssetId = props.coverAssetId ?? null;
    this.likeCount = props.likeCount ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this._taskDefinitions = props.taskDefinitions ?? [];
  }

  get taskDefinitions(): ReadonlyArray<TaskDefinition> {
    return this._taskDefinitions;
  }

  // ─── Commands ──────────────────────────────────────────────────────────────

  /**
   * Publish a DRAFT journey.
   * Invariant: cannot publish if it has no tasks.
   */
  publish(): void {
    if (this.status !== 'DRAFT') {
      throw new DomainError(
        `Cannot publish a journey that is already ${this.status}.`,
        'JOURNEY_NOT_DRAFT',
      );
    }
    if (this._taskDefinitions.length === 0) {
      throw new DomainError(
        'Cannot publish a journey with no tasks. Add at least one task first.',
        'JOURNEY_HAS_NO_TASKS',
      );
    }
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  /**
   * Archive a PUBLISHED journey.
   */
  archive(): void {
    if (this.status !== 'PUBLISHED') {
      throw new DomainError(
        `Only a PUBLISHED journey can be archived. Current status: ${this.status}.`,
        'JOURNEY_NOT_PUBLISHED',
      );
    }
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }

  /**
   * Add a task definition.
   *
   * Invariants:
   *  - A DRAFT journey can have tasks added freely.
   *  - A PUBLISHED journey only accepts ADDITIVE additions (no edits/removals).
   *    The caller must pass the next orderIndex — we enforce uniqueness here.
   *  - An ARCHIVED journey cannot receive new tasks.
   */
  addTask(task: TaskDefinition): void {
    if (this.status === 'ARCHIVED') {
      throw new DomainError(
        'Cannot add tasks to an ARCHIVED journey.',
        'JOURNEY_ARCHIVED',
      );
    }

    // Enforce orderIndex uniqueness within the aggregate
    const duplicate = this._taskDefinitions.find(
      (t) => t.orderIndex === task.orderIndex,
    );
    if (duplicate) {
      throw new DomainError(
        `A task with orderIndex ${task.orderIndex} already exists on this journey.`,
        'TASK_ORDER_INDEX_DUPLICATE',
      );
    }

    this._taskDefinitions.push(task);
    this.updatedAt = new Date();
  }

  /**
   * Guard used by the Participation context before allowing a join.
   */
  canBeJoined(): boolean {
    return this.status === 'PUBLISHED' && this.visibility === 'PUBLIC';
  }

  /**
   * Returns true only if the given userId is the curator.
   */
  isCurator(userId: UserId): boolean {
    return this.curatorId.equals(userId);
  }

  /**
   * Increment the denormalized like count (driven by a domain event handler).
   * Only the event handler calls this — controllers never mutate this directly.
   */
  incrementLikeCount(): void {
    this.likeCount += 1;
    this.updatedAt = new Date();
  }

  decrementLikeCount(): void {
    this.likeCount = Math.max(0, this.likeCount - 1);
    this.updatedAt = new Date();
  }
}
