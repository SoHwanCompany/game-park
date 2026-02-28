import { api } from '@/lib/axios';
import { type ApiResponse } from '@/types/api';
import { type RegisterFormValues } from '@/app/(auth)/_schemas/auth';

interface RegisterResponse {
  id: string;
  email: string;
  nickname: string;
}

export const postRegister = async (
  data: RegisterFormValues,
): Promise<ApiResponse<RegisterResponse>> => {
  const response = await api.post<ApiResponse<RegisterResponse>>('/api/auth/register', data);

  return response.data;
};
