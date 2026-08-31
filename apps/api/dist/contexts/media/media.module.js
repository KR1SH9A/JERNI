"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const media_storage_provider_1 = require("./application/ports/media-storage.provider");
const disabled_media_adapter_1 = require("./infrastructure/adapters/disabled-media.adapter");
const feature_flag_orm_entity_1 = require("./infrastructure/persistence/feature-flag.orm-entity");
const feature_flag_service_1 = require("./application/feature-flag.service");
const config_controller_1 = require("./infrastructure/http/config.controller");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [nestjs_1.MikroOrmModule.forFeature([feature_flag_orm_entity_1.FeatureFlagOrmEntity])],
        providers: [
            feature_flag_service_1.FeatureFlagService,
            /**
             * Phase 1: wire DisabledMediaAdapter as the default provider.
             * Phase 1.5: replace useClass with a factory that reads feature_flags.config.provider
             * and returns CloudinaryMediaAdapter or DisabledMediaAdapter accordingly.
             */
            {
                provide: media_storage_provider_1.MEDIA_STORAGE_PROVIDER,
                useClass: disabled_media_adapter_1.DisabledMediaAdapter,
            },
        ],
        controllers: [config_controller_1.ConfigController],
        exports: [media_storage_provider_1.MEDIA_STORAGE_PROVIDER, feature_flag_service_1.FeatureFlagService],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map