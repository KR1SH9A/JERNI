"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurationModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const journey_repository_1 = require("./application/ports/journey.repository");
const journey_commands_1 = require("./application/use-cases/journey.commands");
const journey_queries_1 = require("./application/use-cases/journey.queries");
const like_count_projection_1 = require("./application/event-handlers/like-count.projection");
const journey_orm_entity_1 = require("./infrastructure/persistence/journey.orm-entity");
const task_definition_orm_entity_1 = require("./infrastructure/persistence/task-definition.orm-entity");
const mikro_orm_journey_repository_1 = require("./infrastructure/persistence/mikro-orm-journey.repository");
const curation_controller_1 = require("./infrastructure/http/curation.controller");
let CurationModule = class CurationModule {
};
exports.CurationModule = CurationModule;
exports.CurationModule = CurationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_1.MikroOrmModule.forFeature([journey_orm_entity_1.JourneyOrmEntity, task_definition_orm_entity_1.TaskDefinitionOrmEntity]),
        ],
        providers: [
            { provide: journey_repository_1.JOURNEY_REPOSITORY, useClass: mikro_orm_journey_repository_1.MikroOrmJourneyRepository },
            journey_commands_1.CreateJourneyUseCase,
            journey_commands_1.AddTaskDefinitionUseCase,
            journey_commands_1.PublishJourneyUseCase,
            journey_commands_1.UpdateJourneyUseCase,
            journey_commands_1.ArchiveJourneyUseCase,
            journey_queries_1.GetDiscoverFeedQuery,
            journey_queries_1.GetJourneyDetailQuery,
            journey_queries_1.GetMyJourneysQuery,
            // Event handler: keeps denormalized likeCount in sync when Engagement fires
            like_count_projection_1.LikeCountProjection,
        ],
        controllers: [curation_controller_1.CurationController],
        exports: [journey_repository_1.JOURNEY_REPOSITORY, journey_queries_1.GetJourneyDetailQuery],
    })
], CurationModule);
//# sourceMappingURL=curation.module.js.map