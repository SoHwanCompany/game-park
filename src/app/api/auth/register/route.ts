import crypto from 'node:crypto';

import bcrypt from 'bcryptjs';
import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/app/(auth)/_schemas/auth';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const body: unknown = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const { email, password, name } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('EMAIL_EXISTS', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userId: crypto.randomUUID(),
        nickname: name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
      },
    });

    return successResponse(user, '회원가입이 완료되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
