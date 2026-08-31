/**
 * JourneyId — branded UUID for journeys.
 */
export declare class JourneyId {
    readonly value: string;
    readonly _brand: 'JourneyId';
    private constructor();
    static of(raw: string): JourneyId;
    equals(other: JourneyId): boolean;
    toString(): string;
    toJSON(): string;
}
//# sourceMappingURL=journey-id.vo.d.ts.map