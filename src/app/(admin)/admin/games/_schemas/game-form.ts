import { z } from 'zod';

export const gameFormSchema = z.object({
  code: z
    .string()
    .min(1, '코드는 필수입니다.')
    .max(50, '코드는 50자 이하여야 합니다.')
    .regex(/^[a-z0-9-]+$/, '소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.'),
  title: z.string().min(1, '제목은 필수입니다.').max(200),
  description: z.string().min(1, '설명은 필수입니다.'),
  categoryId: z.string().min(1, '카테고리를 선택해주세요.'),
  thumbnailUrl: z.string().url('올바른 URL이어야 합니다.'),
  gameUrl: z.string().url('올바른 URL이어야 합니다.'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED']),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;
