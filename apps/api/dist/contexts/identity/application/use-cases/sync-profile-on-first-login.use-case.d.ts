import { UserProfile } from '../../domain/user-profile.entity';
import { UserProfileRepository } from '../ports/user-profile.repository';
/**
 * SyncProfileOnFirstLoginUseCase
 *
 * Called on the first authenticated request from a user who has no profile row yet.
 * Creates a minimal profile from the JWT claims (email or display_name) and persists it.
 *
 * This is the ONLY place a UserProfile is ever created — never from a controller body.
 */
export declare class SyncProfileOnFirstLoginUseCase {
    private readonly profileRepo;
    constructor(profileRepo: UserProfileRepository);
    execute(input: {
        userId: string;
        email?: string;
        displayName?: string;
    }): Promise<UserProfile>;
}
//# sourceMappingURL=sync-profile-on-first-login.use-case.d.ts.map