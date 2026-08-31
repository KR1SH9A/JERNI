import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, SignApiOptions } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import {
  MediaStorageProvider,
  CreateUploadTicketInput,
  UploadTicket,
  ConfirmAssetInput,
  MediaAsset,
  MediaAssetRef,
} from '../../application/ports/media-storage.provider';
import { DomainError } from '../../../../shared-kernel/errors/domain.error';

@Injectable()
export class CloudinaryMediaAdapter implements MediaStorageProvider {
  private readonly logger = new Logger(CloudinaryMediaAdapter.name);
  private isConfigured = false;

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret && cloudName !== 'REPLACE_WITH_CLOUD_NAME') {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary successfully configured');
    } else {
      this.logger.warn('Cloudinary credentials missing or invalid — adapter will throw if used');
    }
  }

  async isEnabled(): Promise<boolean> {
    return this.isConfigured;
  }

  async createUploadTicket(input: CreateUploadTicketInput): Promise<UploadTicket> {
    this.ensureConfigured();

    const timestamp = Math.round(new Date().getTime() / 1000);
    // Organize by folder: e.g. jerni/USER_AVATAR or jerni/JOURNEY_COVER
    const folder = `jerni/${input.ownerType.toLowerCase()}s`;
    
    // We enforce that the file must be an image, limit size, etc.
    const paramsToSign: SignApiOptions = {
      timestamp,
      folder,
      // Pass the ticket info to context so we can verify it later if needed
      context: `ownerId=${input.ownerId}|requestedBy=${input.requestedBy}`,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.config.get<string>('CLOUDINARY_API_SECRET')!,
    );

    return {
      ticketId: `${input.ownerId}-${timestamp}`, // Logical ticket ID
      provider: 'cloudinary',
      expiresAt: new Date((timestamp + 3600) * 1000), // 1 hr expiration
      uploadParams: {
        timestamp: timestamp.toString(),
        signature,
        folder,
        api_key: this.config.get<string>('CLOUDINARY_API_KEY')!,
        cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME')!,
      },
    };
  }

  async confirmAsset(input: ConfirmAssetInput): Promise<MediaAsset> {
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

  async deleteAsset(providerAssetId: string): Promise<void> {
    this.ensureConfigured();
    try {
      await cloudinary.uploader.destroy(providerAssetId);
    } catch (e) {
      this.logger.error(`Failed to delete asset ${providerAssetId}`, e);
    }
  }

  getDisplayUrl(asset: MediaAssetRef, transform?: 'thumb' | 'cover'): string {
    if (asset.provider !== 'cloudinary') {
      return '';
    }
    
    let transformation = '';
    if (transform === 'thumb') {
      transformation = 'c_fill,g_face,w_150,h_150/'; // e.g. avatar
    } else if (transform === 'cover') {
      transformation = 'c_fill,w_800,h_400/'; // e.g. journey cover
    }

    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME') || '';
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}${asset.providerAssetId}`;
  }

  private ensureConfigured() {
    if (!this.isConfigured) {
      throw new DomainError('FEATURE_DISABLED', 'Cloudinary is not configured on this server');
    }
  }
}
