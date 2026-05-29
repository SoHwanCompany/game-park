import { z } from 'zod';

export const categoryFormSchema = z.object({
  code: z
    .string()
    .min(1, '코드는 필수입니다.')
    .max(50)
    .regex(/^[a-z0-9-]+$/, '소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.'),
  name: z.string().min(1, '이름은 필수입니다.').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
