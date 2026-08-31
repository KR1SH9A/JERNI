// Shared types between API and web app
// Phase 1: minimal set — expand as needed

export type TaskKind = 'MILESTONE' | 'RECURRING';
export type JourneyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type JourneyVisibility = 'PUBLIC' | 'PRIVATE';

export interface JourneyCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  likeCount: number;
  taskCount: number;
  status: JourneyStatus;
  visibility: JourneyVisibility;
  createdAt: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  orderIndex: number;
  kind: TaskKind;
  recurrenceRule: string | null;
}
