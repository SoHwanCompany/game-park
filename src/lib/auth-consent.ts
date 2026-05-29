import { cookies } from 'next/headers';

import { socialConsentSchema, type SocialConsentValues } from '@/app/(auth)/_schemas/auth';

const SOCIAL_CONSENT_COOKIE_NAME = 'social-signup-consent';
const SOCIAL_CONSENT_MAX_AGE = 10 * 60;

const parseConsentCookie = (value: string): SocialConsentValues | null => {
  try {
    const parsed = JSON.parse(value) as unknown;
    const result = socialConsentSchema.safeParse(parsed);

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
};

export const buildConsentTimestamps = (
  consent: SocialConsentValues,
  agreedAt: Date,
): {
  termsAgreedAt: Date;
  privacyAgreedAt: Date;
  marketingAgreedAt?: Date;
} => {
  return {
    termsAgreedAt: agreedAt,
    privacyAgreedAt: agreedAt,
    ...(consent.marketingAgreed ? { marketingAgreedAt: agreedAt } : {}),
  };
};

export const setSocialConsentCookie = async (consent: SocialConsentValues): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set(SOCIAL_CONSENT_COOKIE_NAME, JSON.stringify(consent), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SOCIAL_CONSENT_MAX_AGE,
  });
};

export const getSocialConsentCookie = async (): Promise<SocialConsentValues | null> => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SOCIAL_CONSENT_COOKIE_NAME);

  if (!cookie) {
    return null;
  }

  return parseConsentCookie(cookie.value);
};

export const clearSocialConsentCookie = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.delete(SOCIAL_CONSENT_COOKIE_NAME);
};
