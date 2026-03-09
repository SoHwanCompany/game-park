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

export const FEEDBACK_STATUSES = [
  { value: 'PENDING', label: '접수 전' },
  { value: 'CONFIRMED', label: '확인했어요' },
  { value: 'IN_REVIEW', label: '살펴보는 중' },
  { value: 'RESOLVED', label: '반영했어요' },
  { value: 'DEFERRED', label: '다음에 참고할게요' },
] as const;

export const FEEDBACK_STATUS_MAP: Record<string, string> = {
  PENDING: '접수 전',
  CONFIRMED: '확인했어요',
  IN_REVIEW: '살펴보는 중',
  RESOLVED: '반영했어요',
  DEFERRED: '다음에 참고할게요',
} as const;

export const REPORT_REASONS = [
  { value: 'PROFANITY', label: '욕설 / 비방' },
  { value: 'SPAM', label: '스팸 / 광고' },
  { value: 'INAPPROPRIATE', label: '부적절한 내용' },
  { value: 'OTHER', label: '기타' },
] as const;
