import { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserProfileRepository } from '../../application/ports/user-profile.repository';
export declare class IdentityController {
    private readonly profileRepo;
    constructor(profileRepo: UserProfileRepository);
    /**
     * GET /me — Returns the authenticated user's profile.
     *
     * This is the Phase 0 deliverable: a user can sign up and hit one
     * authenticated endpoint that proves end-to-end auth is wired correctly.
     */
    getMe(user: AuthenticatedUser): Promise<{
        id: string;
        email: string | undefined;
        displayName: string | null;
        avatarProvider: string | null;
        avatarAssetId: string | null;
        createdAt: Date | null;
    }>;
}
//# sourceMappingURL=identity.controller.d.ts.map