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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = exports.CreateTicketDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const media_storage_provider_1 = require("../../application/ports/media-storage.provider");
const class_validator_1 = require("class-validator");
class CreateTicketDto {
    ownerType;
    ownerId;
}
exports.CreateTicketDto = CreateTicketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['USER_AVATAR', 'JOURNEY_COVER']),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "ownerType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "ownerId", void 0);
let MediaController = class MediaController {
    mediaProvider;
    constructor(mediaProvider) {
        this.mediaProvider = mediaProvider;
    }
    async createTicket(dto, req) {
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
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload-tickets'),
    (0, swagger_1.ApiOperation)({ summary: 'Request a signed upload ticket for Cloudinary' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTicketDto, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "createTicket", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('media'),
    __param(0, (0, common_1.Inject)(media_storage_provider_1.MEDIA_STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], MediaController);
//# sourceMappingURL=media.controller.js.map