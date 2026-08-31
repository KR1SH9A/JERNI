"use strict";
/**
 * MediaStorageProvider — the port (interface) that Curation and Identity depend on.
 *
 * Architecture decision:
 * Neither Curation nor Identity imports any concrete adapter class — they only
 * import this interface. This is the exact boundary that makes "swap Cloudinary
 * for S3 later" a single-file change with zero ripple to other contexts.
 *
 * See Phase 1.5 for CloudinaryMediaAdapter implementing this same interface.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEDIA_STORAGE_PROVIDER = void 0;
exports.MEDIA_STORAGE_PROVIDER = Symbol('MEDIA_STORAGE_PROVIDER');
//# sourceMappingURL=media-storage.provider.js.map