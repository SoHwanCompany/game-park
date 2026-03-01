export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'title', label: '가나다순' },
  { value: 'likes', label: '좋아요순' },
] as const;

export const DEFAULT_THUMBNAIL = '/images/games/default-thumbnail.svg';

export const ALL_CATEGORY = { code: 'all', name: '전체' } as const;
