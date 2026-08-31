import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MEDIA_STORAGE_PROVIDER } from './application/ports/media-storage.provider';
import { DisabledMediaAdapter } from './infrastructure/adapters/disabled-media.adapter';
import { FeatureFlagOrmEntity } from './infrastructure/persistence/feature-flag.orm-entity';
import { FeatureFlagService } from './application/feature-flag.service';
import { ConfigController } from './infrastructure/http/config.controller';

@Module({
  imports: [MikroOrmModule.forFeature([FeatureFlagOrmEntity])],
  providers: [
    FeatureFlagService,

    /**
     * Phase 1: wire DisabledMediaAdapter as the default provider.
     * Phase 1.5: replace useClass with a factory that reads feature_flags.config.provider
     * and returns CloudinaryMediaAdapter or DisabledMediaAdapter accordingly.
     */
    {
      provide: MEDIA_STORAGE_PROVIDER,
      useClass: DisabledMediaAdapter,
    },
  ],
  controllers: [ConfigController],
  exports: [MEDIA_STORAGE_PROVIDER, FeatureFlagService],
})
export class MediaModule {}
