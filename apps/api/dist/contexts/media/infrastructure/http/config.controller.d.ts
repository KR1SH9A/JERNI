import { FeatureFlagService } from '../../application/feature-flag.service';
export declare class ConfigController {
    private readonly featureFlags;
    constructor(featureFlags: FeatureFlagService);
    /**
     * GET /config/features — Returns enabled feature flags.
     *
     * @Public — the frontend calls this on load to decide which UI widgets to show.
     * No sensitive data — just boolean flags.
     */
    getFeatures(): Promise<{
        mediaUploads: boolean;
    }>;
}
//# sourceMappingURL=config.controller.d.ts.map