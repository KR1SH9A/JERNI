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
exports.SyncProfileOnFirstLoginUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_profile_entity_1 = require("../../domain/user-profile.entity");
const user_profile_repository_1 = require("../ports/user-profile.repository");
/**
 * SyncProfileOnFirstLoginUseCase
 *
 * Called on the first authenticated request from a user who has no profile row yet.
 * Creates a minimal profile from the JWT claims (email or display_name) and persists it.
 *
 * This is the ONLY place a UserProfile is ever created — never from a controller body.
 */
let SyncProfileOnFirstLoginUseCase = class SyncProfileOnFirstLoginUseCase {
    profileRepo;
    constructor(profileRepo) {
        this.profileRepo = profileRepo;
    }
    async execute(input) {
        const existing = await this.profileRepo.findById(input.userId);
        if (existing)
            return existing;
        const profile = new user_profile_entity_1.UserProfile({
            id: input.userId,
            displayName: input.displayName ??
                input.email?.split('@')[0] ??
                `user_${input.userId.slice(0, 8)}`,
        });
        await this.profileRepo.save(profile);
        return profile;
    }
};
exports.SyncProfileOnFirstLoginUseCase = SyncProfileOnFirstLoginUseCase;
exports.SyncProfileOnFirstLoginUseCase = SyncProfileOnFirstLoginUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_profile_repository_1.USER_PROFILE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], SyncProfileOnFirstLoginUseCase);
//# sourceMappingURL=sync-profile-on-first-login.use-case.js.map