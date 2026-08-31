/**
 * UserProfile — thin domain entity for the Identity context.
 *
 * This is NOT a Supabase Auth user — it's our application-level projection
 * of the auth user, owning only the fields we actually need in the app domain.
 * Created/synced on first login, never replaces Supabase as the auth source.
 */
export class UserProfile {
  readonly id: string; // = Supabase auth.uid()
  displayName: string;
  avatarProvider: string | null;
  avatarAssetId: string | null;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    displayName: string;
    avatarProvider?: string | null;
    avatarAssetId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.displayName = props.displayName;
    this.avatarProvider = props.avatarProvider ?? null;
    this.avatarAssetId = props.avatarAssetId ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  updateDisplayName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Display name cannot be empty');
    }
    this.displayName = name.trim();
    this.updatedAt = new Date();
  }
}
