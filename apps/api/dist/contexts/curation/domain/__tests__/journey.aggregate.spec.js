"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const journey_aggregate_1 = require("../journey.aggregate");
const task_definition_entity_1 = require("../task-definition.entity");
const journey_id_vo_1 = require("../../../../shared-kernel/value-objects/journey-id.vo");
const user_id_vo_1 = require("../../../../shared-kernel/value-objects/user-id.vo");
const makeJourney = (overrides = {}) => new journey_aggregate_1.Journey({
    id: journey_id_vo_1.JourneyId.of('00000000-0000-0000-0000-000000000001'),
    curatorId: user_id_vo_1.UserId.of('user-a'),
    title: 'Test Journey',
    ...overrides,
});
const makeTask = (orderIndex = 0, kind = 'MILESTONE') => new task_definition_entity_1.TaskDefinition({
    id: `task-${orderIndex}`,
    journeyId: '00000000-0000-0000-0000-000000000001',
    title: `Task ${orderIndex}`,
    orderIndex,
    kind,
    recurrenceRule: kind === 'RECURRING' ? 'DAILY' : undefined,
});
describe('Journey aggregate invariants', () => {
    // ── Publish ──────────────────────────────────────────────────────────────
    describe('publish()', () => {
        it('publishes a DRAFT journey with at least one task', () => {
            const j = makeJourney();
            j.addTask(makeTask(0));
            j.publish();
            expect(j.status).toBe('PUBLISHED');
        });
        it('throws JOURNEY_HAS_NO_TASKS when publishing with no tasks', () => {
            const j = makeJourney();
            expect(() => j.publish()).toThrowError(expect.objectContaining({ code: 'JOURNEY_HAS_NO_TASKS' }));
        });
        it('throws JOURNEY_NOT_DRAFT when publishing an already-published journey', () => {
            // Pass tasks via constructor — never touch private fields in tests
            const j = makeJourney({ status: 'PUBLISHED', taskDefinitions: [makeTask(0)] });
            expect(() => j.publish()).toThrowError(expect.objectContaining({ code: 'JOURNEY_NOT_DRAFT' }));
        });
        it('throws JOURNEY_NOT_DRAFT when publishing an ARCHIVED journey', () => {
            const j = makeJourney({ status: 'ARCHIVED' });
            expect(() => j.publish()).toThrowError(expect.objectContaining({ code: 'JOURNEY_NOT_DRAFT' }));
        });
    });
    // ── Archive ──────────────────────────────────────────────────────────────
    describe('archive()', () => {
        it('archives a PUBLISHED journey', () => {
            const j = makeJourney({ status: 'PUBLISHED' });
            j.archive();
            expect(j.status).toBe('ARCHIVED');
        });
        it('throws JOURNEY_NOT_PUBLISHED when archiving a DRAFT', () => {
            const j = makeJourney();
            expect(() => j.archive()).toThrowError(expect.objectContaining({ code: 'JOURNEY_NOT_PUBLISHED' }));
        });
    });
    // ── addTask ───────────────────────────────────────────────────────────────
    describe('addTask()', () => {
        it('adds tasks to a DRAFT journey', () => {
            const j = makeJourney();
            j.addTask(makeTask(0));
            j.addTask(makeTask(1));
            expect(j.taskDefinitions).toHaveLength(2);
        });
        it('adds tasks additively to a PUBLISHED journey', () => {
            const j = makeJourney({ status: 'PUBLISHED' });
            j.addTask(makeTask(0));
            j.addTask(makeTask(1));
            expect(j.taskDefinitions).toHaveLength(2);
        });
        it('throws JOURNEY_ARCHIVED when adding a task to an archived journey', () => {
            const j = makeJourney({ status: 'ARCHIVED' });
            expect(() => j.addTask(makeTask(0))).toThrowError(expect.objectContaining({ code: 'JOURNEY_ARCHIVED' }));
        });
        it('throws TASK_ORDER_INDEX_DUPLICATE when two tasks share an orderIndex', () => {
            const j = makeJourney();
            j.addTask(makeTask(0));
            expect(() => j.addTask(makeTask(0))).toThrowError(expect.objectContaining({ code: 'TASK_ORDER_INDEX_DUPLICATE' }));
        });
    });
    // ── canBeJoined ───────────────────────────────────────────────────────────
    describe('canBeJoined()', () => {
        it('returns true for PUBLISHED PUBLIC journeys', () => {
            const j = makeJourney({ status: 'PUBLISHED', visibility: 'PUBLIC' });
            expect(j.canBeJoined()).toBe(true);
        });
        it('returns false for DRAFT journeys', () => {
            expect(makeJourney({ status: 'DRAFT' }).canBeJoined()).toBe(false);
        });
        it('returns false for PRIVATE journeys even if published', () => {
            expect(makeJourney({ status: 'PUBLISHED', visibility: 'PRIVATE' }).canBeJoined()).toBe(false);
        });
    });
    // ── isCurator ─────────────────────────────────────────────────────────────
    describe('isCurator()', () => {
        it('returns true for the curator', () => {
            const j = makeJourney({ curatorId: user_id_vo_1.UserId.of('user-a') });
            expect(j.isCurator(user_id_vo_1.UserId.of('user-a'))).toBe(true);
        });
        it('returns false for a different user', () => {
            const j = makeJourney({ curatorId: user_id_vo_1.UserId.of('user-a') });
            expect(j.isCurator(user_id_vo_1.UserId.of('user-b'))).toBe(false);
        });
    });
    // ── likeCount ─────────────────────────────────────────────────────────────
    describe('like count', () => {
        it('increments like count', () => {
            const j = makeJourney();
            j.incrementLikeCount();
            expect(j.likeCount).toBe(1);
        });
        it('does not go below 0 on decrement', () => {
            const j = makeJourney({ likeCount: 0 });
            j.decrementLikeCount();
            expect(j.likeCount).toBe(0);
        });
    });
});
// ── TaskDefinition invariants ─────────────────────────────────────────────
describe('TaskDefinition invariants', () => {
    it('creates a valid MILESTONE task without a recurrenceRule', () => {
        const t = new task_definition_entity_1.TaskDefinition({
            id: 'task-1',
            journeyId: 'journey-1',
            title: 'Read docs',
            orderIndex: 0,
            kind: 'MILESTONE',
        });
        expect(t.kind).toBe('MILESTONE');
        expect(t.recurrenceRule).toBeNull();
    });
    it('creates a valid RECURRING task with recurrenceRule=DAILY', () => {
        const t = new task_definition_entity_1.TaskDefinition({
            id: 'task-2',
            journeyId: 'journey-1',
            title: 'Daily review',
            orderIndex: 1,
            kind: 'RECURRING',
            recurrenceRule: 'DAILY',
        });
        expect(t.recurrenceRule).toBe('DAILY');
    });
    it('throws TASK_MISSING_RECURRENCE_RULE for RECURRING task without a rule', () => {
        expect(() => new task_definition_entity_1.TaskDefinition({
            id: 'task-3',
            journeyId: 'journey-1',
            title: 'Daily review',
            orderIndex: 1,
            kind: 'RECURRING',
            // recurrenceRule intentionally omitted
        })).toThrowError(expect.objectContaining({ code: 'TASK_MISSING_RECURRENCE_RULE' }));
    });
    it('throws TASK_UNEXPECTED_RECURRENCE_RULE for MILESTONE task with a rule', () => {
        expect(() => new task_definition_entity_1.TaskDefinition({
            id: 'task-4',
            journeyId: 'journey-1',
            title: 'One-time task',
            orderIndex: 2,
            kind: 'MILESTONE',
            recurrenceRule: 'DAILY',
        })).toThrowError(expect.objectContaining({ code: 'TASK_UNEXPECTED_RECURRENCE_RULE' }));
    });
});
//# sourceMappingURL=journey.aggregate.spec.js.map