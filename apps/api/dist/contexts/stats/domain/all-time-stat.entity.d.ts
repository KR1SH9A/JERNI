/**
 * AllTimeStat — read model entity for the Stats bounded context.
 *
 * One row per (journey, user). Tracks overall progress.
 * milestonesCompleted  — incremented permanently when a MILESTONE task is completed.
 * recurringDoneToday   — incremented for today, reset each calendar day by the daily projection.
 *
 * NOTE: recurringDoneToday is a convenience field for "how many recurring tasks
 * did this user hit today?" It is zeroed out by the event handler when it is
 * recording a TaskUncompleted for today's date. Rebuilding from task_completions
 * would recompute it correctly.
 */
export interface AllTimeStat {
    journeyId: string;
    userId: string;
    displayName: string;
    milestonesCompleted: number;
    recurringDoneToday: number;
}
//# sourceMappingURL=all-time-stat.entity.d.ts.map