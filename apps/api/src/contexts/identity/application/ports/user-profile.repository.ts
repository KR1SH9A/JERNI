import { UserProfile } from '../../domain/user-profile.entity';

export interface UserProfileRepository {
  findById(id: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}

export const USER_PROFILE_REPOSITORY = Symbol('USER_PROFILE_REPOSITORY');
