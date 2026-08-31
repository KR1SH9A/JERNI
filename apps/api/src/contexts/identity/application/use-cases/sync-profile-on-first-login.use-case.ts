import { Injectable, Inject } from '@nestjs/common';
import { UserProfile } from '../../domain/user-profile.entity';
import {
  UserProfileRepository,
  USER_PROFILE_REPOSITORY,
} from '../ports/user-profile.repository';

/**
 * SyncProfileOnFirstLoginUseCase
 *
 * Called on the first authenticated request from a user who has no profile row yet.
 * Creates a minimal profile from the JWT claims (email or display_name) and persists it.
 *
 * This is the ONLY place a UserProfile is ever created — never from a controller body.
 */
@Injectable()
export class SyncProfileOnFirstLoginUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profileRepo: UserProfileRepository,
  ) {}

  async execute(input: {
    userId: string;
    email?: string;
    displayName?: string;
  }): Promise<UserProfile> {
    const existing = await this.profileRepo.findById(input.userId);
    if (existing) return existing;

    const profile = new UserProfile({
      id: input.userId,
      displayName:
        input.displayName ??
        input.email?.split('@')[0] ??
        `user_${input.userId.slice(0, 8)}`,
    });

    await this.profileRepo.save(profile);
    return profile;
  }
}
