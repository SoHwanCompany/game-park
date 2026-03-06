import { type FeedbackCategory } from '@prisma/client';

export interface FeedbackSummary {
  id: string;
  title: string;
  category: FeedbackCategory;
  customCategory: string | null;
  isPublic: boolean;
  createdAt: string;
  user: {
    nickname: string;
  };
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
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
  };
  comments: FeedbackCommentItem[];
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
