import { type FeedbackCategory, type FeedbackStatus } from '@prisma/client';

export interface FeedbackSummary {
  id: string;
  title: string;
  category: FeedbackCategory;
  customCategory: string | null;
  status: FeedbackStatus;
  isPublic: boolean;
  createdAt: string;
  user: {
    nickname: string;
  };
  game: {
    title: string;
  } | null;
  _count: {
    comments: number;
  };
}

export interface FeedbackDetail {
  id: string;
  title: string;
  content: string;
  category: FeedbackCategory;
  customCategory: string | null;
  status: FeedbackStatus;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
  };
  game: {
    id: string;
    title: string;
  } | null;
  comments: FeedbackCommentItem[];
  statusLogs: FeedbackStatusLogItem[];
}

export interface FeedbackCommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
  };
}

export interface FeedbackStatusLogItem {
  id: string;
  status: FeedbackStatus;
  comment: string | null;
  createdAt: string;
  user: {
    nickname: string;
  };
}
