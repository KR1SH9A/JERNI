import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

/**
 * MikroORM entity mapping for the `user_profiles` table.
 *
 * Note: this lives in the Infrastructure layer — domain code (UserProfile entity)
 * never imports this class. The repository adapter maps between them.
 */
@Entity({ tableName: 'user_profiles' })
export class UserProfileOrmEntity {
  @PrimaryKey({ type: 'text' })
  id!: string;

  @Property({ type: 'text', fieldName: 'display_name' })
  displayName!: string;

  @Property({ type: 'text', nullable: true, fieldName: 'avatar_provider' })
  avatarProvider: string | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'avatar_asset_id' })
  avatarAssetId: string | null = null;

  @Property({ type: 'timestamptz', onCreate: () => new Date(), fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date(), fieldName: 'updated_at' })
  updatedAt: Date = new Date();
}
