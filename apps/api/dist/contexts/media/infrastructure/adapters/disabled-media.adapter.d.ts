import { MediaStorageProvider, UploadTicket, MediaAsset, CreateUploadTicketInput, ConfirmAssetInput, MediaAssetRef } from '../../application/ports/media-storage.provider';
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
export declare class DisabledMediaAdapter implements MediaStorageProvider {
    isEnabled(): Promise<boolean>;
    createUploadTicket(_input: CreateUploadTicketInput): Promise<UploadTicket>;
    confirmAsset(_input: ConfirmAssetInput): Promise<MediaAsset>;
    deleteAsset(_providerAssetId: string): Promise<void>;
    /**
     * Resolves a display URL for an existing asset.
     *
     * Even when uploads are disabled, previously uploaded assets should still be
     * resolvable (the feature flag stops NEW uploads, not display of old content).
     * In DisabledAdapter we return null/empty — callers should fall back to a
     * placeholder. This is fine because DisabledAdapter is only active when NO
     * assets have ever been uploaded (Phase 1 with no Cloudinary configured).
     */
    getDisplayUrl(_asset: MediaAssetRef, _transform?: 'thumb' | 'cover'): string;
}
//# sourceMappingURL=disabled-media.adapter.d.ts.map