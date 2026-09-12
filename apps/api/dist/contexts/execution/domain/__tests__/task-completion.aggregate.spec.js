"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_completion_aggregate_1 = require("../task-completion.aggregate");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const domain_error_1 = require("../../../../shared-kernel/errors/domain.error");
const journeyId = journey_id_vo_1.JourneyId.of('11111111-1111-1111-1111-111111111111');
const userId = user_id_vo_1.UserId.of('user-abc-123');
const taskDefId = '22222222-2222-2222-2222-222222222222';
function makeCompletion(overrides = {}) {
    return task_completion_aggregate_1.TaskCompletion.create({
        id: '33333333-3333-3333-3333-333333333333',
        journeyId,
        userId,
        taskDefinitionId: taskDefId,
        taskKindSnapshot: 'MILESTONE',
        forDate: null,
        ...overrides,
    });
}
describe('TaskCompletion Aggregate', () => {
    // ── Factory invariants ────────────────────────────────────────────────────
    describe('create()', () => {
        it('creates a MILESTONE completion with forDate = null', () => {
            const completion = makeCompletion({ taskKindSnapshot: 'MILESTONE', forDate: null });
            expect(completion.forDate).toBeNull();
            expect(completion.taskKindSnapshot).toBe('MILESTONE');
            expect(completion.isActive()).toBe(true);
        });
        it('creates a RECURRING completion with a forDate', () => {
            const completion = makeCompletion({
                taskKindSnapshot: 'RECURRING',
                forDate: '2026-09-12',
            });
            expect(completion.forDate).toBe('2026-09-12');
            expect(completion.taskKindSnapshot).toBe('RECURRING');
        });
        it('throws RECURRING_MISSING_FOR_DATE when RECURRING has no forDate', () => {
            expect(() => makeCompletion({ taskKindSnapshot: 'RECURRING', forDate: null })).toThrow(domain_error_1.DomainError);
            try {
                makeCompletion({ taskKindSnapshot: 'RECURRING', forDate: null });
            }
            catch (e) {
                expect(e.code).toBe('RECURRING_MISSING_FOR_DATE');
            }
        });
        it('throws MILESTONE_UNEXPECTED_FOR_DATE when MILESTONE has a forDate', () => {
            expect(() => makeCompletion({ taskKindSnapshot: 'MILESTONE', forDate: '2026-09-12' })).toThrow(domain_error_1.DomainError);
            try {
                makeCompletion({ taskKindSnapshot: 'MILESTONE', forDate: '2026-09-12' });
            }
            catch (e) {
                expect(e.code).toBe('MILESTONE_UNEXPECTED_FOR_DATE');
            }
        });
    });
    // ── uncomplete() invariants ───────────────────────────────────────────────
    describe('uncomplete()', () => {
        it('sets revokedAt and marks the completion inactive', () => {
            const completion = makeCompletion();
            expect(completion.isActive()).toBe(true);
            completion.uncomplete();
            expect(completion.revokedAt).toBeInstanceOf(Date);
            expect(completion.isActive()).toBe(false);
        });
        it('throws COMPLETION_ALREADY_REVOKED when called twice', () => {
            const completion = makeCompletion();
            completion.uncomplete();
            expect(() => completion.uncomplete()).toThrow(domain_error_1.DomainError);
            try {
                completion.uncomplete();
            }
            catch (e) {
                expect(e.code).toBe('COMPLETION_ALREADY_REVOKED');
            }
        });
    });
    // ── reconstitute() ────────────────────────────────────────────────────────
    describe('reconstitute()', () => {
        it('rehydrates a completion from persistence without validation', () => {
            const completedAt = new Date('2026-09-10T10:00:00Z');
            const revokedAt = new Date('2026-09-10T11:00:00Z');
            const completion = task_completion_aggregate_1.TaskCompletion.reconstitute({
                id: 'some-id',
                journeyId,
                userId,
                taskDefinitionId: taskDefId,
                taskKindSnapshot: 'RECURRING',
                forDate: '2026-09-10',
                completedAt,
                revokedAt,
            });
            expect(completion.forDate).toBe('2026-09-10');
            expect(completion.completedAt).toBe(completedAt);
            expect(completion.revokedAt).toBe(revokedAt);
            expect(completion.isActive()).toBe(false);
        });
    });
});
//# sourceMappingURL=task-completion.aggregate.spec.js.map