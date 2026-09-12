"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const curation_module_1 = require("../curation/curation.module");
const membership_repository_1 = require("./application/ports/membership.repository");
const participation_commands_1 = require("./application/use-cases/participation.commands");
const participation_queries_1 = require("./application/use-cases/participation.queries");
const membership_orm_entity_1 = require("./infrastructure/persistence/membership.orm-entity");
const mikro_orm_membership_repository_1 = require("./infrastructure/persistence/mikro-orm-membership.repository");
const participation_controller_1 = require("./infrastructure/http/participation.controller");
let ParticipationModule = class ParticipationModule {
};
exports.ParticipationModule = ParticipationModule;
exports.ParticipationModule = ParticipationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_1.MikroOrmModule.forFeature([membership_orm_entity_1.MembershipOrmEntity]),
            // Imports JOURNEY_REPOSITORY token to guard joinability
            curation_module_1.CurationModule,
        ],
        providers: [
            { provide: membership_repository_1.MEMBERSHIP_REPOSITORY, useClass: mikro_orm_membership_repository_1.MikroOrmMembershipRepository },
            participation_commands_1.JoinJourneyUseCase,
            participation_commands_1.LeaveJourneyUseCase,
            participation_queries_1.GetMembershipStatusQuery,
        ],
        controllers: [participation_controller_1.ParticipationController],
        // Export repo + query so ExecutionModule can verify membership before task completion
        exports: [membership_repository_1.MEMBERSHIP_REPOSITORY, participation_queries_1.GetMembershipStatusQuery],
    })
], ParticipationModule);
//# sourceMappingURL=participation.module.js.map