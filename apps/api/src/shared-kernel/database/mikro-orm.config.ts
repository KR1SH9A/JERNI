import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import * as path from 'path';

// Explicit entity imports — required for ts-node (no dist/ to glob against)
import { UserProfileOrmEntity } from '../../contexts/identity/infrastructure/persistence/user-profile.orm-entity';
import { JourneyOrmEntity } from '../../contexts/curation/infrastructure/persistence/journey.orm-entity';
import { TaskDefinitionOrmEntity } from '../../contexts/curation/infrastructure/persistence/task-definition.orm-entity';
import { FeatureFlagOrmEntity } from '../../contexts/media/infrastructure/persistence/feature-flag.orm-entity';
import { MembershipOrmEntity } from '../../contexts/participation/infrastructure/persistence/membership.orm-entity';
import { LikeOrmEntity } from '../../contexts/engagement/infrastructure/persistence/like.orm-entity';
import { TaskCompletionOrmEntity } from '../../contexts/execution/infrastructure/persistence/task-completion.orm-entity';

/**
 * Returns the MikroORM configuration object.
 *
 * Using a factory function (not a static export) so ConfigModule can be
 * initialized before this runs — important for env-var access in NestJS.
 */
export function mikroOrmConfig() {
  return defineConfig({
    driver: PostgreSqlDriver,
    clientUrl: process.env.DATABASE_URL,
    entities: [
      UserProfileOrmEntity,
      JourneyOrmEntity,
      TaskDefinitionOrmEntity,
      FeatureFlagOrmEntity,
      MembershipOrmEntity,
      LikeOrmEntity,
      TaskCompletionOrmEntity,
    ],
    metadataProvider: TsMorphMetadataProvider,
    extensions: [Migrator],
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
