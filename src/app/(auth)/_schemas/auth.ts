import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, '이메일을 입력해주세요.')
  .max(255, '이메일은 255자 이하여야 합니다.')
  .email('올바른 이메일 주소를 입력해주세요.')
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .max(72, '비밀번호는 72자 이하여야 합니다.')
  .regex(/[A-Za-z]/, '비밀번호에 영문자를 포함해주세요.')
  .regex(/\d/, '비밀번호에 숫자를 포함해주세요.')
  .regex(/[^A-Za-z0-9]/, '비밀번호에 특수문자를 포함해주세요.')
  .regex(/^\S+$/, '비밀번호에 공백을 포함할 수 없습니다.');

const nicknameSchema = z
  .string()
  .trim()
  .min(2, '닉네임은 2자 이상이어야 합니다.')
  .max(50, '닉네임은 50자 이하여야 합니다.');

const requiredConsentSchema = (message: string) =>
  z.boolean().refine((value) => value, { message });

export const authConsentSchema = z.object({
  termsAgreed: requiredConsentSchema('서비스 이용약관에 동의해주세요.'),
  privacyAgreed: requiredConsentSchema('개인정보 수집 및 이용에 동의해주세요.'),
  marketingAgreed: z.boolean(),
});

export type AuthConsentValues = z.infer<typeof authConsentSchema>;

export const defaultAuthConsentValues: AuthConsentValues = {
  termsAgreed: false,
  privacyAgreed: false,
  marketingAgreed: false,
};

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    nickname: nicknameSchema,
  })
  .merge(authConsentSchema)
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .max(72, '비밀번호는 72자 이하여야 합니다.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const socialConsentSchema = authConsentSchema;

export type SocialConsentValues = z.infer<typeof socialConsentSchema>;
