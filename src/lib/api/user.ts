import { api } from '@/lib/axios';
import { type ApiResponse } from '@/types/api';
import { type ProfileUpdateFormValues } from '@/app/(mypage)/mypage/_schemas/profile';

interface ProfileResponse {
  id: string;
  email: string;
  nickname: string;
}

export const putProfile = async (
  data: ProfileUpdateFormValues,
): Promise<ApiResponse<ProfileResponse>> => {
  const response = await api.put<ApiResponse<ProfileResponse>>('/api/user/profile', data);

  return response.data;
};

export const deleteWithdraw = async (): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>('/api/user/withdraw');

  return response.data;
};
