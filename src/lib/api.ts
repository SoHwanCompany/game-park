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
  GAME_CODE_EXISTS: '이미 사용 중인 게임 코드입니다.',
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  CATEGORY_CODE_EXISTS: '이미 사용 중인 카테고리 코드입니다.',
  CATEGORY_NAME_EXISTS: '이미 사용 중인 카테고리 이름입니다.',
  CATEGORY_HAS_GAMES: '소속된 게임이 있어 삭제할 수 없습니다.',
  FEEDBACK_NOT_FOUND: '게시글을 찾을 수 없습니다.',
  COMMENT_NOT_FOUND: '댓글을 찾을 수 없습니다.',
  FORBIDDEN: '권한이 없습니다.',
  USER_SUSPENDED: '정지된 계정입니다.',
  ALREADY_REPORTED: '이미 신고한 게시글입니다.',
  REPORT_NOT_FOUND: '신고를 찾을 수 없습니다.',
  RANKING_NOT_FOUND: '랭킹 기록을 찾을 수 없습니다.',
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
