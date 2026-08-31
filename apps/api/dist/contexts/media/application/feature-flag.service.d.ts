import { EntityRepository } from '@mikro-orm/core';
import { FeatureFlagOrmEntity } from '../infrastructure/persistence/feature-flag.orm-entity';
export declare class FeatureFlagService {
    private readonly repo;
    private readonly cache;
    private readonly TTL_MS;
    constructor(repo: EntityRepository<FeatureFlagOrmEntity>);
    isEnabled(key: string): Promise<boolean>;
    getConfig(key: string): Promise<Record<string, unknown>>;
    set(key: string, enabled: boolean, config?: Record<string, unknown>): Promise<void>;
    private get;
}
//# sourceMappingURL=feature-flag.service.d.ts.map