import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.email('올바른 이메일 주소를 입력해주세요.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    passwordConfirm: z.string(),
    name: z.string().min(2, '닉네임은 2자 이상이어야 합니다.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('올바른 이메일 주소를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
