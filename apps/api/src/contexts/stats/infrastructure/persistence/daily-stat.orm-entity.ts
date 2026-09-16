import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'daily_stats' })
export class DailyStatOrmEntity {
  @PrimaryKey({ type: 'uuid', fieldName: 'journey_id' })
  journeyId!: string;

  @PrimaryKey({ type: 'text', fieldName: 'user_id' })
  userId!: string;

  @PrimaryKey({ type: 'uuid', fieldName: 'task_definition_id' })
  taskDefinitionId!: string;

  @PrimaryKey({ type: 'date', fieldName: 'for_date' })
  forDate!: string;

  @Property({ type: 'smallint', fieldName: 'completed_count' })
  completedCount: number = 0;
}
