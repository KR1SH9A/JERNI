/**
 * UserId — a branded string value object wrapping the Supabase auth.uid().
 *
 * Rule: no other context ever stores a raw `string` where a UserId is expected.
 * This makes cross-context leakage (e.g. passing a JourneyId as a UserId) a
 * compile-time error, not a runtime mystery.
 */
export class UserId {
  readonly _brand: 'UserId' = 'UserId';

  private constructor(public readonly value: string) {}

  static of(raw: string): UserId {
    if (!raw || raw.trim() === '') {
      throw new Error('UserId cannot be empty');
    }
    return new UserId(raw);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
