/**
 * UserProfile — thin domain entity for the Identity context.
 *
 * This is NOT a Supabase Auth user — it's our application-level projection
 * of the auth user, owning only the fields we actually need in the app domain.
 * Created/synced on first login, never replaces Supabase as the auth source.
 */
export declare class UserProfile {
    readonly id: string;
    displayName: string;
    avatarProvider: string | null;
    avatarAssetId: string | null;
    readonly createdAt: Date;
    updatedAt: Date;
    constructor(props: {
        id: string;
        displayName: string;
        avatarProvider?: string | null;
        avatarAssetId?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
    });
    updateDisplayName(name: string): void;
}
//# sourceMappingURL=user-profile.entity.d.ts.map