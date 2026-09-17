"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../../../../../shared-kernel/events");
const task_completed_handler_1 = require("../task-completed.handler");
const task_uncompleted_handler_1 = require("../task-uncompleted.handler");
// ─── Mock ─────────────────────────────────────────────────────────────────────
const mockStatsRepo = {
    upsertDailyStat: jest.fn().mockResolvedValue(undefined),
    upsertAllTimeStat: jest.fn().mockResolvedValue(undefined),
    getJourneyStats: jest.fn(),
};
// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Stats Projection Handlers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    // ── TaskCompletedHandler ───────────────────────────────────────────────────
    describe('TaskCompletedHandler', () => {
        let handler;
        beforeEach(() => {
            handler = new task_completed_handler_1.TaskCompletedHandler(mockStatsRepo);
        });
        it('upserts daily_stat with delta=+1 for RECURRING task', async () => {
            const event = new events_1.TaskCompletedEvent('journey-1', 'user-1', 'task-1', 'RECURRING', '2025-01-15');
            await handler.handle(event);
            expect(mockStatsRepo.upsertDailyStat).toHaveBeenCalledWith('journey-1', 'user-1', 'task-1', '2025-01-15', 1);
        });
        it('uses today for daily_stat when MILESTONE task (forDate=null)', async () => {
            const today = new Date().toISOString().split('T')[0];
            const event = new events_1.TaskCompletedEvent('journey-1', 'user-1', 'task-2', 'MILESTONE', null);
            await handler.handle(event);
            expect(mockStatsRepo.upsertDailyStat).toHaveBeenCalledWith('journey-1', 'user-1', 'task-2', today, 1);
        });
        it('upserts all_time_stat with MILESTONE kind and delta=+1', async () => {
            const event = new events_1.TaskCompletedEvent('journey-1', 'user-1', 'task-2', 'MILESTONE', null);
            await handler.handle(event);
            expect(mockStatsRepo.upsertAllTimeStat).toHaveBeenCalledWith('journey-1', 'user-1', 'MILESTONE', null, 1);
        });
        it('upserts all_time_stat with RECURRING kind and delta=+1', async () => {
            const event = new events_1.TaskCompletedEvent('journey-1', 'user-1', 'task-1', 'RECURRING', '2025-01-15');
            await handler.handle(event);
            expect(mockStatsRepo.upsertAllTimeStat).toHaveBeenCalledWith('journey-1', 'user-1', 'RECURRING', '2025-01-15', 1);
        });
        it('calls both upserts in parallel (both called per event)', async () => {
            const event = new events_1.TaskCompletedEvent('journey-1', 'user-1', 'task-1', 'RECURRING', '2025-01-15');
            await handler.handle(event);
            expect(mockStatsRepo.upsertDailyStat).toHaveBeenCalledTimes(1);
            expect(mockStatsRepo.upsertAllTimeStat).toHaveBeenCalledTimes(1);
        });
    });
    // ── TaskUncompletedHandler ─────────────────────────────────────────────────
    describe('TaskUncompletedHandler', () => {
        let handler;
        beforeEach(() => {
            handler = new task_uncompleted_handler_1.TaskUncompletedHandler(mockStatsRepo);
        });
        it('upserts daily_stat with delta=-1 for RECURRING uncomplete', async () => {
            const event = new events_1.TaskUncompletedEvent('journey-1', 'user-1', 'task-1', '2025-01-15');
            await handler.handle(event);
            expect(mockStatsRepo.upsertDailyStat).toHaveBeenCalledWith('journey-1', 'user-1', 'task-1', '2025-01-15', -1);
        });
        it('uses today for daily_stat when MILESTONE uncomplete (forDate=null)', async () => {
            const today = new Date().toISOString().split('T')[0];
            const event = new events_1.TaskUncompletedEvent('journey-1', 'user-1', 'task-2', null);
            await handler.handle(event);
            expect(mockStatsRepo.upsertDailyStat).toHaveBeenCalledWith('journey-1', 'user-1', 'task-2', today, -1);
        });
        it('infers MILESTONE kind from forDate=null and decrements with delta=-1', async () => {
            const event = new events_1.TaskUncompletedEvent('journey-1', 'user-1', 'task-2', null);
            await handler.handle(event);
            expect(mockStatsRepo.upsertAllTimeStat).toHaveBeenCalledWith('journey-1', 'user-1', 'MILESTONE', null, -1);
        });
        it('infers RECURRING kind from non-null forDate and decrements with delta=-1', async () => {
            const event = new events_1.TaskUncompletedEvent('journey-1', 'user-1', 'task-1', '2025-01-15');
            await handler.handle(event);
            expect(mockStatsRepo.upsertAllTimeStat).toHaveBeenCalledWith('journey-1', 'user-1', 'RECURRING', '2025-01-15', -1);
        });
    });
});
//# sourceMappingURL=stats.projection.spec.js.map