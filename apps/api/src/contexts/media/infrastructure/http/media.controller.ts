import { Controller, Post, Body, Inject, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MEDIA_STORAGE_PROVIDER, MediaStorageProvider, AssetOwnerType } from '../../application/ports/media-storage.provider';
import { IsString, IsIn } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsIn(['USER_AVATAR', 'JOURNEY_COVER'])
  ownerType!: AssetOwnerType;

  @IsString()
  ownerId!: string;
}

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(
    @Inject(MEDIA_STORAGE_PROVIDER)
    private readonly mediaProvider: MediaStorageProvider,
  ) {}

  @Post('upload-tickets')
  @ApiOperation({ summary: 'Request a signed upload ticket for Cloudinary' })
  async createTicket(@Body() dto: CreateTicketDto, @Request() req: any) {
    const userId = req.user.sub; // From JWT
    
    // In a full implementation, we would verify here that the user actually 
    // owns the ownerId (e.g., if ownerType is JOURNEY_COVER, they are the curator)
    // For Phase 1.5, we'll keep it simple as the adapter handles basic tagging

    const ticket = await this.mediaProvider.createUploadTicket({
      ownerType: dto.ownerType,
      ownerId: dto.ownerId,
      requestedBy: userId,
    });

    return ticket;
  }
}
