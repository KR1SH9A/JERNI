import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'task_completions' })
export class TaskCompletionOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'journey_id' })
  journeyId!: string;

  @Property({ type: 'text', fieldName: 'user_id' })
  userId!: string;

  @Property({ type: 'uuid', fieldName: 'task_definition_id' })
  taskDefinitionId!: string;

  @Property({ type: 'text', fieldName: 'task_kind_snapshot' })
  taskKindSnapshot!: string;

  /**
   * ISO date string 'YYYY-MM-DD' for RECURRING tasks; null for MILESTONE.
   * The DB unique constraint treats NULL = NULL (NULLS NOT DISTINCT),
   * so two milestone completions for the same task will violate the constraint.
   */
  @Property({ type: 'date', nullable: true, fieldName: 'for_date' })
  forDate: string | null = null;

  @Property({ type: 'timestamptz', fieldName: 'completed_at' })
  completedAt: Date = new Date();

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'revoked_at' })
  revokedAt: Date | null = null;
}
