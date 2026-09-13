"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyUnlikedEvent = exports.JourneyLikedEvent = exports.TaskUncompletedEvent = exports.TaskCompletedEvent = exports.MemberLeftEvent = exports.MemberJoinedEvent = void 0;
// ─── Participation Events ────────────────────────────────────────────────────
class MemberJoinedEvent {
    journeyId;
    userId;
    joinedAt;
    constructor(journeyId, userId, joinedAt) {
        this.journeyId = journeyId;
        this.userId = userId;
        this.joinedAt = joinedAt;
    }
}
exports.MemberJoinedEvent = MemberJoinedEvent;
class MemberLeftEvent {
    journeyId;
    userId;
    constructor(journeyId, userId) {
        this.journeyId = journeyId;
        this.userId = userId;
    }
}
exports.MemberLeftEvent = MemberLeftEvent;
// ─── Execution Events ────────────────────────────────────────────────────────
class TaskCompletedEvent {
    journeyId;
    userId;
    taskDefinitionId;
    taskKind;
    forDate;
    constructor(journeyId, userId, taskDefinitionId, taskKind, forDate) {
        this.journeyId = journeyId;
        this.userId = userId;
        this.taskDefinitionId = taskDefinitionId;
        this.taskKind = taskKind;
        this.forDate = forDate;
    }
}
exports.TaskCompletedEvent = TaskCompletedEvent;
class TaskUncompletedEvent {
    journeyId;
    userId;
    taskDefinitionId;
    forDate;
    constructor(journeyId, userId, taskDefinitionId, forDate) {
        this.journeyId = journeyId;
        this.userId = userId;
        this.taskDefinitionId = taskDefinitionId;
        this.forDate = forDate;
    }
}
exports.TaskUncompletedEvent = TaskUncompletedEvent;
// ─── Engagement Events ───────────────────────────────────────────────────────
class JourneyLikedEvent {
    journeyId;
    userId;
    constructor(journeyId, userId) {
        this.journeyId = journeyId;
        this.userId = userId;
    }
}
exports.JourneyLikedEvent = JourneyLikedEvent;
class JourneyUnlikedEvent {
    journeyId;
    userId;
    constructor(journeyId, userId) {
        this.journeyId = journeyId;
        this.userId = userId;
    }
}
exports.JourneyUnlikedEvent = JourneyUnlikedEvent;
//# sourceMappingURL=index.js.map