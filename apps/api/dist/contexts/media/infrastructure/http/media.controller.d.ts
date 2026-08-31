import { MediaStorageProvider, AssetOwnerType } from '../../application/ports/media-storage.provider';
export declare class CreateTicketDto {
    ownerType: AssetOwnerType;
    ownerId: string;
}
export declare class MediaController {
    private readonly mediaProvider;
    constructor(mediaProvider: MediaStorageProvider);
    createTicket(dto: CreateTicketDto, req: any): Promise<import("../../application/ports/media-storage.provider").UploadTicket>;
}
//# sourceMappingURL=media.controller.d.ts.map