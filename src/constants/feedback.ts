export const FEEDBACK_CATEGORIES = [
  { value: 'BUG', label: '버그 신고' },
  { value: 'FEATURE', label: '기능 제안' },
  { value: 'GENERAL', label: '일반 의견' },
  { value: 'GAME_REQUEST', label: '게임 요청' },
  { value: 'OTHER', label: '기타' },
] as const;

export const FEEDBACK_CATEGORY_MAP: Record<string, string> = {
  BUG: '버그 신고',
  FEATURE: '기능 제안',
  GENERAL: '일반 의견',
  GAME_REQUEST: '게임 요청',
  OTHER: '기타',
} as const;

export const FEEDBACK_PAGE_SIZE = 10;
