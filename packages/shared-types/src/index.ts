// Shared types between API and web app
// Phase 3: expanded with Stats, Curator Dashboard, and Engagement status types

export type TaskKind = 'MILESTONE' | 'RECURRING';
export type JourneyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type JourneyVisibility = 'PUBLIC' | 'PRIVATE';

// ── Journey ───────────────────────────────────────────────────────────────────

export interface JourneyCard {
  id: string;
  curatorId: string;
  title: string;
  description: string;
  tags: string[];
  likeCount: number;
  taskCount: number;
  status: JourneyStatus;
  visibility: JourneyVisibility;
  coverProvider: string | null;
  coverAssetId: string | null;
  createdAt: string;
}

export interface CuratorJourneyCard extends JourneyCard {
  /** Live COUNT(*) from memberships WHERE status='ACTIVE' */
  memberCount: number;
}

export interface JoinedJourneyCard extends JourneyCard {
  joinedAt: string; // ISO date string
}

export interface TaskSummary {
  id: string;
  title: string;
  orderIndex: number;
  kind: TaskKind;
  recurrenceRule: string | null;
}

// ── Execution ─────────────────────────────────────────────────────────────────

export interface TaskProgressReadModel {
  taskDefinitionId: string;
  taskKindSnapshot: string;
  /** ISO date string for recurring; null for milestone */
  forDate: string | null;
  completedAt: string;
  revokedAt: string | null;
  isActive: boolean;
}

export interface MyProgressResult {
  journeyId: string;
  userId: string;
  completions: TaskProgressReadModel[];
}

// ── Participation ─────────────────────────────────────────────────────────────

export interface MembershipStatusResult {
  isMember: boolean;
}

// ── Engagement ────────────────────────────────────────────────────────────────

export interface LikeStatusResult {
  isLiked: boolean;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface TodayBoardEntry {
  userId: string;
  displayName: string;
  completedToday: number;
  totalTasks: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  milestonesCompleted: number;
  recurringDoneToday: number;
}

export interface JourneyStatsReadModel {
  journeyId: string;
  todayBoard: TodayBoardEntry[];
  allTimeLeaderboard: LeaderboardEntry[];
}
