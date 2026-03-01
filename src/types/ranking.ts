import { type CategoryItem } from '@/types/game';

export interface GameRankingItem {
  rank: number;
  id: string;
  code: string;
  title: string;
  thumbnailUrl: string;
  category: CategoryItem;
  likeCount: number;
  playCount: number;
}

export interface UserRankingItem {
  rank: number;
  userId: string;
  nickname: string;
  profileUrl: string | null;
  score: number;
  updatedAt: string;
}

export type GameRankingSortType = 'likes' | 'plays';
