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
  payload: Record<string, never>;
}

export type PlatformToGameMessage = PlatformInitMessage | PlatformControlMessage;

export interface GameReadyMessage {
  type: 'READY';
  payload: Record<string, never>;
}

export interface GameScoreMessage {
  type: 'SCORE';
  payload: { score: number };
}

export interface GameOverMessage {
  type: 'GAME_OVER';
  payload: { userId: string; gameId: string; score: number; playtime: number };
}

export interface GameErrorMessage {
  type: 'ERROR';
  payload: { code: string; message: string };
}

export type GameToPlatformMessage =
  | GameReadyMessage
  | GameScoreMessage
  | GameOverMessage
  | GameErrorMessage;
