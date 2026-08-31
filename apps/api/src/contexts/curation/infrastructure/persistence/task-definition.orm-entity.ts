import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { JourneyOrmEntity } from './journey.orm-entity';

@Entity({ tableName: 'task_definitions' })
export class TaskDefinitionOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => JourneyOrmEntity, { fieldName: 'journey_id' })
  journey!: JourneyOrmEntity;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'integer', fieldName: 'order_index' })
  orderIndex!: number;

  @Property({ type: 'text' })
  kind!: string;

  @Property({ type: 'text', nullable: true, fieldName: 'recurrence_rule' })
  recurrenceRule: string | null = null;

  @Property({ type: 'timestamptz', onCreate: () => new Date(), fieldName: 'created_at' })
  createdAt: Date = new Date();
}
