import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { FeatureFlagOrmEntity } from '../infrastructure/persistence/feature-flag.orm-entity';

/**
 * FeatureFlagService — reads from the feature_flags table with an in-memory TTL cache.
 *
 * Cache TTL: 30 seconds — admin flips a flag and it propagates within 30s,
 * without needing a redeploy. This is the explicit design decision from §3.6.
 *
 * The cache is per-instance (no Redis needed for Phase 1 — single NestJS process).
 * Phase 6 hardening note: if horizontal scaling is introduced, use Redis for the
 * cache instead of in-process Map.
 */

interface CacheEntry {
  value: { enabled: boolean; config: Record<string, unknown> };
  expiresAt: number;
}

@Injectable()
export class FeatureFlagService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 30_000; // 30 seconds

  constructor(
    @InjectRepository(FeatureFlagOrmEntity)
    private readonly repo: EntityRepository<FeatureFlagOrmEntity>,
  ) {}

  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.get(key);
    return flag?.enabled ?? false;
  }

  async getConfig(key: string): Promise<Record<string, unknown>> {
    const flag = await this.get(key);
    return flag?.config ?? {};
  }

  async set(
    key: string,
    enabled: boolean,
    config?: Record<string, unknown>,
  ): Promise<void> {
    const em = this.repo.getEntityManager();
    let flag = await this.repo.findOne({ key });

    if (!flag) {
      flag = em.create(FeatureFlagOrmEntity, { key, enabled, config: config ?? {}, updatedAt: new Date() });
      em.persist(flag);
    } else {
      flag.enabled = enabled;
      if (config !== undefined) flag.config = config;
      flag.updatedAt = new Date();
    }

    await em.flush();
    // Invalidate cache on write
    this.cache.delete(key);
  }

  private async get(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    const flag = await this.repo.findOne({ key });
    if (!flag) return null;

    const value = { enabled: flag.enabled, config: flag.config as Record<string, unknown> };
    this.cache.set(key, { value, expiresAt: Date.now() + this.TTL_MS });
    return value;
  }
}
