import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { setSocialConsentCookie } from '@/lib/auth-consent';
import { socialConsentSchema } from '@/app/(auth)/_schemas/auth';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const body: unknown = await request.json();
    const result = socialConsentSchema.safeParse(body);

    if (!result.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    await setSocialConsentCookie(result.data);

    return successResponse(null, '소셜 회원가입 동의가 저장되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
