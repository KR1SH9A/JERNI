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
exports.IdentityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const common_2 = require("@nestjs/common");
const user_profile_repository_1 = require("../../application/ports/user-profile.repository");
let IdentityController = class IdentityController {
    profileRepo;
    constructor(profileRepo) {
        this.profileRepo = profileRepo;
    }
    /**
     * GET /me — Returns the authenticated user's profile.
     *
     * This is the Phase 0 deliverable: a user can sign up and hit one
     * authenticated endpoint that proves end-to-end auth is wired correctly.
     */
    async getMe(user) {
        const profile = await this.profileRepo.findById(user.id);
        return {
            id: user.id,
            email: user.email,
            displayName: profile?.displayName ?? null,
            avatarProvider: profile?.avatarProvider ?? null,
            avatarAssetId: profile?.avatarAssetId ?? null,
            createdAt: profile?.createdAt ?? null,
        };
    }
};
exports.IdentityController = IdentityController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "getMe", null);
exports.IdentityController = IdentityController = __decorate([
    (0, swagger_1.ApiTags)('Identity'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __param(0, (0, common_2.Inject)(user_profile_repository_1.USER_PROFILE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], IdentityController);
//# sourceMappingURL=identity.controller.js.map