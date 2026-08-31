"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../../identity/infrastructure/decorators/public.decorator");
const feature_flag_service_1 = require("../../application/feature-flag.service");
let ConfigController = class ConfigController {
    featureFlags;
    constructor(featureFlags) {
        this.featureFlags = featureFlags;
    }
    /**
     * GET /config/features — Returns enabled feature flags.
     *
     * @Public — the frontend calls this on load to decide which UI widgets to show.
     * No sensitive data — just boolean flags.
     */
    async getFeatures() {
        const mediaUploadsEnabled = await this.featureFlags.isEnabled('media_uploads');
        return {
            mediaUploads: mediaUploadsEnabled,
        };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('features'),
    (0, swagger_1.ApiOperation)({ summary: 'Returns currently enabled feature flags (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getFeatures", null);
exports.ConfigController = ConfigController = __decorate([
    (0, swagger_1.ApiTags)('Config'),
    (0, common_1.Controller)('config'),
    __metadata("design:paramtypes", [feature_flag_service_1.FeatureFlagService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map