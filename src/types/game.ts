export interface CategoryItem {
  code: string;
  name: string;
}

export interface GameSummary {
  id: string;
  code: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  likeCount: number;
  playCount: number;
  category: CategoryItem;
  createdAt: string;
  isLiked: boolean;
}

export interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
}

export interface PlatformInitMessage {
  type: 'INIT';
  payload: { userId: string | null; nickname: string | null; gameId: string };
}

export interface PlatformControlMessage {
  type: 'PAUSE' | 'RESUME' | 'TERMINATE';
}

export type PlatformToGameMessage = PlatformInitMessage | PlatformControlMessage;
