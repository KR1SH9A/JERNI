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

export interface UploadTicket {
  ticketId: string;
  provider: string;
  expiresAt: Date;
  // Provider-specific fields needed by the client to perform the upload
  uploadParams: Record<string, string>;
}

export interface MediaAsset {
  provider: string;
  providerAssetId: string;
  confirmedAt: Date;
}

export interface MediaAssetRef {
  provider: string;
  providerAssetId: string;
}

export type AssetOwnerType = 'USER_AVATAR' | 'JOURNEY_COVER';

export interface CreateUploadTicketInput {
  ownerType: AssetOwnerType;
  ownerId: string;
  requestedBy: string; // UserId
}

export interface ConfirmAssetInput {
  ticketId: string;
  providerAssetId: string;
  requestedBy: string;
}

export interface MediaStorageProvider {
  isEnabled(): Promise<boolean>;
  createUploadTicket(input: CreateUploadTicketInput): Promise<UploadTicket>;
  confirmAsset(input: ConfirmAssetInput): Promise<MediaAsset>;
  deleteAsset(providerAssetId: string): Promise<void>;
  getDisplayUrl(
    asset: MediaAssetRef,
    transform?: 'thumb' | 'cover',
  ): string;
}

export const MEDIA_STORAGE_PROVIDER = Symbol('MEDIA_STORAGE_PROVIDER');
