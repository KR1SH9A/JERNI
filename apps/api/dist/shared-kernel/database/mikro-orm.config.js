"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mikroOrmConfig = mikroOrmConfig;
const postgresql_1 = require("@mikro-orm/postgresql");
const reflection_1 = require("@mikro-orm/reflection");
const migrations_1 = require("@mikro-orm/migrations");
const path = __importStar(require("path"));
// Explicit entity imports — required for ts-node (no dist/ to glob against)
const user_profile_orm_entity_1 = require("../../contexts/identity/infrastructure/persistence/user-profile.orm-entity");
const journey_orm_entity_1 = require("../../contexts/curation/infrastructure/persistence/journey.orm-entity");
const task_definition_orm_entity_1 = require("../../contexts/curation/infrastructure/persistence/task-definition.orm-entity");
const feature_flag_orm_entity_1 = require("../../contexts/media/infrastructure/persistence/feature-flag.orm-entity");
const membership_orm_entity_1 = require("../../contexts/participation/infrastructure/persistence/membership.orm-entity");
const like_orm_entity_1 = require("../../contexts/engagement/infrastructure/persistence/like.orm-entity");
const task_completion_orm_entity_1 = require("../../contexts/execution/infrastructure/persistence/task-completion.orm-entity");
/**
 * Returns the MikroORM configuration object.
 *
 * Using a factory function (not a static export) so ConfigModule can be
 * initialized before this runs — important for env-var access in NestJS.
 */
function mikroOrmConfig() {
    return (0, postgresql_1.defineConfig)({
        driver: postgresql_1.PostgreSqlDriver,
        clientUrl: process.env.DATABASE_URL,
        entities: [
            user_profile_orm_entity_1.UserProfileOrmEntity,
            journey_orm_entity_1.JourneyOrmEntity,
            task_definition_orm_entity_1.TaskDefinitionOrmEntity,
            feature_flag_orm_entity_1.FeatureFlagOrmEntity,
            membership_orm_entity_1.MembershipOrmEntity,
            like_orm_entity_1.LikeOrmEntity,
            task_completion_orm_entity_1.TaskCompletionOrmEntity,
        ],
        metadataProvider: reflection_1.TsMorphMetadataProvider,
        extensions: [migrations_1.Migrator],
        migrations: {
            path: path.join(__dirname, '../migrations'),
            pathTs: path.join(__dirname, '../migrations'),
            glob: '!(*.d).{js,ts}',
            transactional: true,
            disableForeignKeys: false,
            allOrNothing: true,
        },
        debug: process.env.NODE_ENV === 'development',
        // Connection pool sizing — keeps Supabase's free-tier connection limit safe
        pool: { min: 2, max: 10 },
        allowGlobalContext: true,
    });
}
//# sourceMappingURL=mikro-orm.config.js.map