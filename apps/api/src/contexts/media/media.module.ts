import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MEDIA_STORAGE_PROVIDER } from './application/ports/media-storage.provider';
import { DisabledMediaAdapter } from './infrastructure/adapters/disabled-media.adapter';
import { FeatureFlagOrmEntity } from './infrastructure/persistence/feature-flag.orm-entity';
import { FeatureFlagService } from './application/feature-flag.service';
import { ConfigController } from './infrastructure/http/config.controller';
import { MediaController } from './infrastructure/http/media.controller';

import { ConfigService } from '@nestjs/config';
import { CloudinaryMediaAdapter } from './infrastructure/adapters/cloudinary-media.adapter';

@Module({
  imports: [MikroOrmModule.forFeature([FeatureFlagOrmEntity])],
  providers: [
    FeatureFlagService,
    {
      provide: MEDIA_STORAGE_PROVIDER,
      inject: [FeatureFlagService, ConfigService],
      useFactory: async (featureFlags: FeatureFlagService, config: ConfigService) => {
        const isEnabled = await featureFlags.isEnabled('media_uploads');
        if (isEnabled) {
          return new CloudinaryMediaAdapter(config);
        }
        return new DisabledMediaAdapter();
      },
    },
  ],
  controllers: [ConfigController, MediaController],
  exports: [MEDIA_STORAGE_PROVIDER, FeatureFlagService],
})
export class MediaModule {}
