import { UserProfile } from '../../domain/user-profile.entity';
export interface UserProfileRepository {
    findById(id: string): Promise<UserProfile | null>;
    save(profile: UserProfile): Promise<void>;
}
export declare const USER_PROFILE_REPOSITORY: unique symbol;
//# sourceMappingURL=user-profile.repository.d.ts.map