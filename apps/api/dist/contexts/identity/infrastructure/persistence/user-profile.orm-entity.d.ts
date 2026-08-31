/**
 * MikroORM entity mapping for the `user_profiles` table.
 *
 * Note: this lives in the Infrastructure layer — domain code (UserProfile entity)
 * never imports this class. The repository adapter maps between them.
 */
export declare class UserProfileOrmEntity {
    id: string;
    displayName: string;
    avatarProvider: string | null;
    avatarAssetId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user-profile.orm-entity.d.ts.map