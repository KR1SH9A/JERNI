import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'memberships' })
export class MembershipOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'journey_id' })
  journeyId!: string;

  @Property({ type: 'text', fieldName: 'user_id' })
  userId!: string;

  @Property({ type: 'timestamptz', fieldName: 'joined_at' })
  joinedAt: Date = new Date();

  @Property({ type: 'text' })
  status: string = 'ACTIVE';
}
