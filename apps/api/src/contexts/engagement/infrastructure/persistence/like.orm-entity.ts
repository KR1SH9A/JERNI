import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'likes' })
export class LikeOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'journey_id' })
  journeyId!: string;

  @Property({ type: 'text', fieldName: 'user_id' })
  userId!: string;

  @Property({ type: 'timestamptz', fieldName: 'liked_at' })
  likedAt: Date = new Date();
}
