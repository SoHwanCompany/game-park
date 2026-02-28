import { NextResponse } from 'next/server';

interface ApiResponse<T> {
  code: string;
  message: string;
  data: T | null;
}

const ERROR_CODES = {
  VALIDATION_ERROR: '입력값이 올바르지 않습니다.',
  EMAIL_EXISTS: '이미 존재하는 이메일입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
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
export type { ApiResponse };
