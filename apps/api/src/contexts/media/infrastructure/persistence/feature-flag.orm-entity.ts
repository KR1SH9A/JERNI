import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'feature_flags' })
export class FeatureFlagOrmEntity {
  @PrimaryKey({ type: 'text' })
  key!: string;

  @Property({ type: 'boolean' })
  enabled: boolean = false;

  @Property({ type: 'json' })
  config: Record<string, unknown> = {};

  @Property({ type: 'timestamptz', onUpdate: () => new Date(), fieldName: 'updated_at' })
  updatedAt: Date = new Date();
}
