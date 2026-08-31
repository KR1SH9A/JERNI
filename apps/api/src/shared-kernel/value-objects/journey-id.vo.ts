/**
 * JourneyId — branded UUID for journeys.
 */
export class JourneyId {
  readonly _brand: 'JourneyId' = 'JourneyId';

  private constructor(public readonly value: string) {}

  static of(raw: string): JourneyId {
    if (!raw || raw.trim() === '') {
      throw new Error('JourneyId cannot be empty');
    }
    return new JourneyId(raw);
  }

  equals(other: JourneyId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
