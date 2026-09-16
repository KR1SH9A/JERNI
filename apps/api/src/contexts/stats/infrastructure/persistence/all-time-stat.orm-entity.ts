import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'all_time_stats' })
export class AllTimeStatOrmEntity {
  @PrimaryKey({ type: 'uuid', fieldName: 'journey_id' })
  journeyId!: string;

  @PrimaryKey({ type: 'text', fieldName: 'user_id' })
  userId!: string;

  @Property({ type: 'text', fieldName: 'display_name' })
  displayName: string = '';

  @Property({ type: 'integer', fieldName: 'milestones_completed' })
  milestonesCompleted: number = 0;

  @Property({ type: 'integer', fieldName: 'recurring_done_today' })
  recurringDoneToday: number = 0;
}
