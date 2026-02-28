import { z } from 'zod';

export const profileUpdateSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(50, '닉네임은 50자 이하여야 합니다.'),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
