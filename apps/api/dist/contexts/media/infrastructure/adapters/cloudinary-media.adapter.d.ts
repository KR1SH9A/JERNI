import { ConfigService } from '@nestjs/config';
import { MediaStorageProvider, CreateUploadTicketInput, UploadTicket, ConfirmAssetInput, MediaAsset, MediaAssetRef } from '../../application/ports/media-storage.provider';
export declare class CloudinaryMediaAdapter implements MediaStorageProvider {
    private readonly config;
    private readonly logger;
    private isConfigured;
    constructor(config: ConfigService);
    isEnabled(): Promise<boolean>;
    createUploadTicket(input: CreateUploadTicketInput): Promise<UploadTicket>;
    confirmAsset(input: ConfirmAssetInput): Promise<MediaAsset>;
    deleteAsset(providerAssetId: string): Promise<void>;
    getDisplayUrl(asset: MediaAssetRef, transform?: 'thumb' | 'cover'): string;
    private ensureConfigured;
}
//# sourceMappingURL=cloudinary-media.adapter.d.ts.map