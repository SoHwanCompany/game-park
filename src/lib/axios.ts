import axios, { type AxiosError } from 'axios';

import { type ApiResponse } from '@/types/api';

export const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<null>>) => {
    if (!error.response) {
      return Promise.reject(new Error('네트워크 연결을 확인해주세요.'));
    }

    const message = error.response.data?.message ?? '서버 오류가 발생했습니다.';

    return Promise.reject(new Error(message));
  },
);
