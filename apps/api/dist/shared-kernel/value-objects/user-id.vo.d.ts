/**
 * UserId — a branded string value object wrapping the Supabase auth.uid().
 *
 * Rule: no other context ever stores a raw `string` where a UserId is expected.
 * This makes cross-context leakage (e.g. passing a JourneyId as a UserId) a
 * compile-time error, not a runtime mystery.
 */
export declare class UserId {
    readonly value: string;
    readonly _brand: 'UserId';
    private constructor();
    static of(raw: string): UserId;
    equals(other: UserId): boolean;
    toString(): string;
    toJSON(): string;
}
//# sourceMappingURL=user-id.vo.d.ts.map