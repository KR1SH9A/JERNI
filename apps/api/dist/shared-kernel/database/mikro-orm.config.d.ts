import { PostgreSqlDriver } from '@mikro-orm/postgresql';
/**
 * Returns the MikroORM configuration object.
 *
 * Using a factory function (not a static export) so ConfigModule can be
 * initialized before this runs — important for env-var access in NestJS.
 */
export declare function mikroOrmConfig(): import("@mikro-orm/core").Options<PostgreSqlDriver, import("@mikro-orm/postgresql").EntityManager<PostgreSqlDriver> & import("@mikro-orm/core").EntityManager<import("@mikro-orm/postgresql").IDatabaseDriver<import("@mikro-orm/postgresql").Connection>>>;
//# sourceMappingURL=mikro-orm.config.d.ts.map