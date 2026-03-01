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

export interface GameEndMessage {
  type: 'GAME_END';
  payload: {
    userId: string;
    score: number;
  };
}
