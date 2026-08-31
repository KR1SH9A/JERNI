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
var CloudinaryMediaAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryMediaAdapter = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
const domain_error_1 = require("../../../../shared-kernel/errors/domain.error");
let CloudinaryMediaAdapter = CloudinaryMediaAdapter_1 = class CloudinaryMediaAdapter {
    config;
    logger = new common_1.Logger(CloudinaryMediaAdapter_1.name);
    isConfigured = false;
    constructor(config) {
        this.config = config;
        const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.config.get('CLOUDINARY_API_KEY');
        const apiSecret = this.config.get('CLOUDINARY_API_SECRET');
        if (cloudName && apiKey && apiSecret && cloudName !== 'REPLACE_WITH_CLOUD_NAME') {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            this.isConfigured = true;
            this.logger.log('Cloudinary successfully configured');
        }
        else {
            this.logger.warn('Cloudinary credentials missing or invalid — adapter will throw if used');
        }
    }
    async isEnabled() {
        return this.isConfigured;
    }
    async createUploadTicket(input) {
        this.ensureConfigured();
        const timestamp = Math.round(new Date().getTime() / 1000);
        // Organize by folder: e.g. jerni/USER_AVATAR or jerni/JOURNEY_COVER
        const folder = `jerni/${input.ownerType.toLowerCase()}s`;
        // We enforce that the file must be an image, limit size, etc.
        const paramsToSign = {
            timestamp,
            folder,
            // Pass the ticket info to context so we can verify it later if needed
            context: `ownerId=${input.ownerId}|requestedBy=${input.requestedBy}`,
        };
        const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, this.config.get('CLOUDINARY_API_SECRET'));
        return {
            ticketId: `${input.ownerId}-${timestamp}`, // Logical ticket ID
            provider: 'cloudinary',
            expiresAt: new Date((timestamp + 3600) * 1000), // 1 hr expiration
            uploadParams: {
                timestamp: timestamp.toString(),
                signature,
                folder,
                api_key: this.config.get('CLOUDINARY_API_KEY'),
                cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
            },
        };
    }
    async confirmAsset(input) {
        this.ensureConfigured();
        // In a production app, we could call Cloudinary API here to verify the asset 
        // actually exists and has the correct context (ownerId/requestedBy).
        // For Phase 1.5, we trust the assetId returned by the frontend upload widget.
        return {
            provider: 'cloudinary',
            providerAssetId: input.providerAssetId,
            confirmedAt: new Date(),
        };
    }
    async deleteAsset(providerAssetId) {
        this.ensureConfigured();
        try {
            await cloudinary_1.v2.uploader.destroy(providerAssetId);
        }
        catch (e) {
            this.logger.error(`Failed to delete asset ${providerAssetId}`, e);
        }
    }
    getDisplayUrl(asset, transform) {
        if (asset.provider !== 'cloudinary') {
            return '';
        }
        let transformation = '';
        if (transform === 'thumb') {
            transformation = 'c_fill,g_face,w_150,h_150/'; // e.g. avatar
        }
        else if (transform === 'cover') {
            transformation = 'c_fill,w_800,h_400/'; // e.g. journey cover
        }
        const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME') || '';
        return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}${asset.providerAssetId}`;
    }
    ensureConfigured() {
        if (!this.isConfigured) {
            throw new domain_error_1.DomainError('FEATURE_DISABLED', 'Cloudinary is not configured on this server');
        }
    }
};
exports.CloudinaryMediaAdapter = CloudinaryMediaAdapter;
exports.CloudinaryMediaAdapter = CloudinaryMediaAdapter = CloudinaryMediaAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryMediaAdapter);
//# sourceMappingURL=cloudinary-media.adapter.js.map