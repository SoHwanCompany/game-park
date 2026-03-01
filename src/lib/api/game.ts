import { api } from '@/lib/axios';
import { type ApiResponse } from '@/types/api';
import { type LikeResponse } from '@/types/game';

export const postPlay = async (gameId: string): Promise<ApiResponse<{ playCount: number }>> => {
  const response = await api.post<ApiResponse<{ playCount: number }>>(`/api/games/${gameId}/play`);

  return response.data;
};

export const postLike = async (gameId: string): Promise<ApiResponse<LikeResponse>> => {
  const response = await api.post<ApiResponse<LikeResponse>>(`/api/games/${gameId}/like`);

  return response.data;
};

export const postRanking = async (
  gameId: string,
  score: number,
  playtime: number,
): Promise<ApiResponse<{ score: number; isNewRecord: boolean }>> => {
  const response = await api.post<ApiResponse<{ score: number; isNewRecord: boolean }>>(
    `/api/games/${gameId}/ranking`,
    { score, playtime },
  );

  return response.data;
};
