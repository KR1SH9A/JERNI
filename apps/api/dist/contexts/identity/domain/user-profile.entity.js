"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
/**
 * UserProfile — thin domain entity for the Identity context.
 *
 * This is NOT a Supabase Auth user — it's our application-level projection
 * of the auth user, owning only the fields we actually need in the app domain.
 * Created/synced on first login, never replaces Supabase as the auth source.
 */
class UserProfile {
    id; // = Supabase auth.uid()
    displayName;
    avatarProvider;
    avatarAssetId;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.displayName = props.displayName;
        this.avatarProvider = props.avatarProvider ?? null;
        this.avatarAssetId = props.avatarAssetId ?? null;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
    updateDisplayName(name) {
        if (!name || name.trim() === '') {
            throw new Error('Display name cannot be empty');
        }
        this.displayName = name.trim();
        this.updatedAt = new Date();
    }
}
exports.UserProfile = UserProfile;
//# sourceMappingURL=user-profile.entity.js.map