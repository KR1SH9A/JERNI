"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const disabled_media_adapter_1 = require("../disabled-media.adapter");
describe('DisabledMediaAdapter', () => {
    const adapter = new disabled_media_adapter_1.DisabledMediaAdapter();
    it('isEnabled() returns false', async () => {
        expect(await adapter.isEnabled()).toBe(false);
    });
    it('createUploadTicket throws FEATURE_DISABLED', async () => {
        await expect(adapter.createUploadTicket({
            ownerType: 'JOURNEY_COVER',
            ownerId: 'journey-1',
            requestedBy: 'user-1',
        })).rejects.toThrowError(expect.objectContaining({ code: 'FEATURE_DISABLED' }));
    });
    it('confirmAsset throws FEATURE_DISABLED', async () => {
        await expect(adapter.confirmAsset({
            ticketId: 'ticket-1',
            providerAssetId: 'asset-1',
            requestedBy: 'user-1',
        })).rejects.toThrowError(expect.objectContaining({ code: 'FEATURE_DISABLED' }));
    });
    it('deleteAsset is a no-op (does not throw)', async () => {
        await expect(adapter.deleteAsset('asset-1')).resolves.toBeUndefined();
    });
    it('getDisplayUrl returns empty string (caller uses placeholder)', () => {
        expect(adapter.getDisplayUrl({ provider: 'disabled', providerAssetId: 'x' })).toBe('');
    });
});
//# sourceMappingURL=disabled-media.adapter.spec.js.map