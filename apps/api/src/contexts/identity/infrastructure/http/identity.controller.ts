import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { Inject } from '@nestjs/common';
import { UserProfileRepository, USER_PROFILE_REPOSITORY } from '../../application/ports/user-profile.repository';

@ApiTags('Identity')
@ApiBearerAuth()
@Controller()
export class IdentityController {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profileRepo: UserProfileRepository,
  ) {}

  /**
   * GET /me — Returns the authenticated user's profile.
   *
   * This is the Phase 0 deliverable: a user can sign up and hit one
   * authenticated endpoint that proves end-to-end auth is wired correctly.
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.profileRepo.findById(user.id);
    return {
      id: user.id,
      email: user.email,
      displayName: profile?.displayName ?? null,
      avatarProvider: profile?.avatarProvider ?? null,
      avatarAssetId: profile?.avatarAssetId ?? null,
      createdAt: profile?.createdAt ?? null,
    };
  }
}
