import { loginSchema, registerSchema, socialConsentSchema } from '@/app/(auth)/_schemas/auth';

describe('auth schemas', () => {
  it('normalizes register input and accepts required consents', () => {
    const result = registerSchema.safeParse({
      email: ' TEST@Example.com ',
      password: 'Password1!',
      passwordConfirm: 'Password1!',
      nickname: '  tester  ',
      termsAgreed: true,
      privacyAgreed: true,
      marketingAgreed: false,
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.email).toBe('test@example.com');
    expect(result.data.nickname).toBe('tester');
  });

  it('rejects register input when required consents are missing', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1!',
      passwordConfirm: 'Password1!',
      nickname: 'tester',
      termsAgreed: false,
      privacyAgreed: true,
      marketingAgreed: false,
    });

    expect(result.success).toBe(false);
  });

  it('rejects overly long emails and weak passwords', () => {
    const result = registerSchema.safeParse({
      email: `${'a'.repeat(250)}@test.com`,
      password: 'passwordonly',
      passwordConfirm: 'passwordonly',
      nickname: 'tester',
      termsAgreed: true,
      privacyAgreed: true,
      marketingAgreed: false,
    });

    expect(result.success).toBe(false);
  });

  it('normalizes login email', () => {
    const result = loginSchema.safeParse({
      email: ' USER@Example.com ',
      password: 'Password1!',
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.email).toBe('user@example.com');
  });

  it('requires mandatory social consents', () => {
    const result = socialConsentSchema.safeParse({
      termsAgreed: true,
      privacyAgreed: false,
      marketingAgreed: false,
    });

    expect(result.success).toBe(false);
  });
});
