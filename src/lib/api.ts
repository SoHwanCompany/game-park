import { NextResponse } from 'next/server';

import { type ApiResponse } from '@/types/api';

const ERROR_CODES = {
  VALIDATION_ERROR: '입력값이 올바르지 않습니다.',
  EMAIL_EXISTS: '이미 존재하는 이메일입니다.',
  NICKNAME_EXISTS: '이미 사용 중인 닉네임입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  GAME_NOT_FOUND: '게임을 찾을 수 없습니다.',
  INTERNAL_ERROR: '서버 오류가 발생했습니다.',
} as const;

type ErrorCode = keyof typeof ERROR_CODES;

const successResponse = <T>(
  data: T,
  message: string,
  status = 200,
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({ code: 'SUCCESS', message, data }, { status });
};

const errorResponse = (
  code: ErrorCode,
  status: number,
  message?: string,
): NextResponse<ApiResponse<null>> => {
  return NextResponse.json({ code, message: message ?? ERROR_CODES[code], data: null }, { status });
};

export { errorResponse, successResponse };
