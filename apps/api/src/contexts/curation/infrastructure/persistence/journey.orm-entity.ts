import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ArrayType,
} from '@mikro-orm/core';
import { TaskDefinitionOrmEntity } from './task-definition.orm-entity';

@Entity({ tableName: 'journeys' })
export class JourneyOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'text', fieldName: 'curator_id' })
  curatorId!: string;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'text' })
  description: string = '';

  @Property({ type: ArrayType, fieldName: 'tags' })
  tags: string[] = [];

  @Property({ type: 'text' })
  visibility: string = 'PUBLIC';

  @Property({ type: 'text' })
  status: string = 'DRAFT';

  @Property({ type: 'text', nullable: true, fieldName: 'cover_provider' })
  coverProvider: string | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'cover_asset_id' })
  coverAssetId: string | null = null;

  @Property({ type: 'integer', fieldName: 'like_count' })
  likeCount: number = 0;

  @Property({ type: 'timestamptz', onCreate: () => new Date(), fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date(), fieldName: 'updated_at' })
  updatedAt: Date = new Date();

  @OneToMany(() => TaskDefinitionOrmEntity, (t) => t.journey, { eager: true })
  taskDefinitions = new Collection<TaskDefinitionOrmEntity>(this);
}
