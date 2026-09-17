"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_1 = require("@mikro-orm/nestjs");
const cqrs_1 = require("@nestjs/cqrs");
const throttler_1 = require("@nestjs/throttler");
// Contexts
const identity_module_1 = require("./contexts/identity/identity.module");
const curation_module_1 = require("./contexts/curation/curation.module");
const media_module_1 = require("./contexts/media/media.module");
const participation_module_1 = require("./contexts/participation/participation.module");
const engagement_module_1 = require("./contexts/engagement/engagement.module");
const execution_module_1 = require("./contexts/execution/execution.module");
const stats_module_1 = require("./contexts/stats/stats.module");
// Shared infra
const mikro_orm_config_1 = require("./shared-kernel/database/mikro-orm.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Config: loads .env, validates required vars
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            // Database: MikroORM connected to Supabase Postgres
            nestjs_1.MikroOrmModule.forRootAsync({
                useFactory: () => (0, mikro_orm_config_1.mikroOrmConfig)(),
            }),
            // CQRS EventBus — in-process pub/sub for domain events
            cqrs_1.CqrsModule.forRoot(),
            // Rate limiting — applied per-controller via @Throttle() or globally
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
            // Bounded-context modules
            identity_module_1.IdentityModule,
            curation_module_1.CurationModule,
            media_module_1.MediaModule,
            participation_module_1.ParticipationModule,
            engagement_module_1.EngagementModule,
            execution_module_1.ExecutionModule,
            stats_module_1.StatsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map