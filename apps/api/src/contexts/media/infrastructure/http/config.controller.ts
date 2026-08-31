import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../identity/infrastructure/decorators/public.decorator';
import { FeatureFlagService } from '../../application/feature-flag.service';

@ApiTags('Config')
@Controller('config')
export class ConfigController {
  constructor(private readonly featureFlags: FeatureFlagService) {}

  /**
   * GET /config/features — Returns enabled feature flags.
   *
   * @Public — the frontend calls this on load to decide which UI widgets to show.
   * No sensitive data — just boolean flags.
   */
  @Public()
  @Get('features')
  @ApiOperation({ summary: 'Returns currently enabled feature flags (public)' })
  async getFeatures() {
    const mediaUploadsEnabled = await this.featureFlags.isEnabled('media_uploads');
    return {
      mediaUploads: mediaUploadsEnabled,
    };
  }
}
