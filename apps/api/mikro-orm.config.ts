import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import * as path from 'path';

// Entity imports — must be explicit so the CLI can discover them without a dist build
import { UserProfileOrmEntity } from './src/contexts/identity/infrastructure/persistence/user-profile.orm-entity';
import { JourneyOrmEntity } from './src/contexts/curation/infrastructure/persistence/journey.orm-entity';
import { TaskDefinitionOrmEntity } from './src/contexts/curation/infrastructure/persistence/task-definition.orm-entity';
import { FeatureFlagOrmEntity } from './src/contexts/media/infrastructure/persistence/feature-flag.orm-entity';
import { MembershipOrmEntity } from './src/contexts/participation/infrastructure/persistence/membership.orm-entity';
import { LikeOrmEntity } from './src/contexts/engagement/infrastructure/persistence/like.orm-entity';
import { TaskCompletionOrmEntity } from './src/contexts/execution/infrastructure/persistence/task-completion.orm-entity';
import { DailyStatOrmEntity } from './src/contexts/stats/infrastructure/persistence/daily-stat.orm-entity';
import { AllTimeStatOrmEntity } from './src/contexts/stats/infrastructure/persistence/all-time-stat.orm-entity';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [
    UserProfileOrmEntity,
    JourneyOrmEntity,
    TaskDefinitionOrmEntity,
    FeatureFlagOrmEntity,
    MembershipOrmEntity,
    LikeOrmEntity,
    TaskCompletionOrmEntity,
    DailyStatOrmEntity,
    AllTimeStatOrmEntity,
  ],
  metadataProvider: TsMorphMetadataProvider,
  extensions: [Migrator],
  migrations: {
    path: path.join(__dirname, 'src/shared-kernel/migrations'),
    pathTs: path.join(__dirname, 'src/shared-kernel/migrations'),
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
  },
  debug: process.env.NODE_ENV === 'development',
});
