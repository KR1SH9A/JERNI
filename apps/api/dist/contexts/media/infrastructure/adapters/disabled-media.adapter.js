"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisabledMediaAdapter = void 0;
const common_1 = require("@nestjs/common");
const domain_error_1 = require("../../../../shared-kernel/errors/domain.error");
/**
 * DisabledMediaAdapter — the default Phase 1 implementation of MediaStorageProvider.
 *
 * isEnabled() always returns false.
 * Every write operation throws FEATURE_DISABLED — caught by DomainErrorFilter → 403.
 *
 * This is NOT a stub or a test double — it is the production implementation for
 * when the feature flag is off. Zero conditionals are needed in Curation or Identity:
 * they call the port, get told "no" cleanly, and surface it to the client.
 *
 * Design note:
 * getDisplayUrl() still works on existing assets so that disabling the flag
 * never retroactively breaks already-uploaded content — it only prevents NEW uploads.
 */
let DisabledMediaAdapter = class DisabledMediaAdapter {
    async isEnabled() {
        return false;
    }
    async createUploadTicket(_input) {
        throw new domain_error_1.DomainError('Image uploads are currently disabled. Contact an administrator.', 'FEATURE_DISABLED');
    }
    async confirmAsset(_input) {
        throw new domain_error_1.DomainError('Image uploads are currently disabled.', 'FEATURE_DISABLED');
    }
    async deleteAsset(_providerAssetId) {
        // No-op: if there's nothing stored, nothing to delete.
    }
    /**
     * Resolves a display URL for an existing asset.
     *
     * Even when uploads are disabled, previously uploaded assets should still be
     * resolvable (the feature flag stops NEW uploads, not display of old content).
     * In DisabledAdapter we return null/empty — callers should fall back to a
     * placeholder. This is fine because DisabledAdapter is only active when NO
     * assets have ever been uploaded (Phase 1 with no Cloudinary configured).
     */
    getDisplayUrl(_asset, _transform) {
        return ''; // Caller falls back to initials/gradient placeholder
    }
};
exports.DisabledMediaAdapter = DisabledMediaAdapter;
exports.DisabledMediaAdapter = DisabledMediaAdapter = __decorate([
    (0, common_1.Injectable)()
], DisabledMediaAdapter);
//# sourceMappingURL=disabled-media.adapter.js.map