import { DisabledMediaAdapter } from '../disabled-media.adapter';
import { DomainError } from '../../../../../shared-kernel/errors/domain.error';

describe('DisabledMediaAdapter', () => {
  const adapter = new DisabledMediaAdapter();

  it('isEnabled() returns false', async () => {
    expect(await adapter.isEnabled()).toBe(false);
  });

  it('createUploadTicket throws FEATURE_DISABLED', async () => {
    await expect(
      adapter.createUploadTicket({
        ownerType: 'JOURNEY_COVER',
        ownerId: 'journey-1',
        requestedBy: 'user-1',
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: 'FEATURE_DISABLED' }),
    );
  });

  it('confirmAsset throws FEATURE_DISABLED', async () => {
    await expect(
      adapter.confirmAsset({
        ticketId: 'ticket-1',
        providerAssetId: 'asset-1',
        requestedBy: 'user-1',
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: 'FEATURE_DISABLED' }),
    );
  });

  it('deleteAsset is a no-op (does not throw)', async () => {
    await expect(adapter.deleteAsset('asset-1')).resolves.toBeUndefined();
  });

  it('getDisplayUrl returns empty string (caller uses placeholder)', () => {
    expect(
      adapter.getDisplayUrl({ provider: 'disabled', providerAssetId: 'x' }),
    ).toBe('');
  });
});
