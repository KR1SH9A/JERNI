"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const like_repository_1 = require("./application/ports/like.repository");
const engagement_commands_1 = require("./application/use-cases/engagement.commands");
const like_orm_entity_1 = require("./infrastructure/persistence/like.orm-entity");
const mikro_orm_like_repository_1 = require("./infrastructure/persistence/mikro-orm-like.repository");
const engagement_controller_1 = require("./infrastructure/http/engagement.controller");
let EngagementModule = class EngagementModule {
};
exports.EngagementModule = EngagementModule;
exports.EngagementModule = EngagementModule = __decorate([
    (0, common_1.Module)({
        imports: [nestjs_1.MikroOrmModule.forFeature([like_orm_entity_1.LikeOrmEntity])],
        providers: [
            { provide: like_repository_1.LIKE_REPOSITORY, useClass: mikro_orm_like_repository_1.MikroOrmLikeRepository },
            engagement_commands_1.LikeJourneyUseCase,
            engagement_commands_1.UnlikeJourneyUseCase,
        ],
        controllers: [engagement_controller_1.EngagementController],
        exports: [like_repository_1.LIKE_REPOSITORY],
    })
], EngagementModule);
//# sourceMappingURL=engagement.module.js.map