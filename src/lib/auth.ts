import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { clearSocialConsentCookie, getSocialConsentCookie } from '@/lib/auth-consent';
import { prisma } from '@/lib/prisma';
import { createCustomAdapter } from '@/lib/prisma-adapter';
import { loginSchema } from '@/app/(auth)/_schemas/auth';

import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: createCustomAdapter(),
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.password) {
          return null;
        }

        if (user.status === 'WITHDRAWN') {
          return null;
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
          image: user.profileUrl,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user, account }) => {
      if (!user.id) {
        return true;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          status: true,
          termsAgreedAt: true,
          privacyAgreedAt: true,
          marketingAgreedAt: true,
        },
      });

      if (dbUser?.status === 'WITHDRAWN') {
        await clearSocialConsentCookie();

        return false;
      }

      if (account?.provider === 'kakao') {
        const consent = await getSocialConsentCookie();

        if (consent) {
          const agreedAt = new Date();
          const updateData: {
            termsAgreedAt?: Date;
            privacyAgreedAt?: Date;
            marketingAgreedAt?: Date;
          } = {};

          if (!dbUser?.termsAgreedAt) {
            updateData.termsAgreedAt = agreedAt;
          }

          if (!dbUser?.privacyAgreedAt) {
            updateData.privacyAgreedAt = agreedAt;
          }

          if (consent.marketingAgreed && !dbUser?.marketingAgreedAt) {
            updateData.marketingAgreedAt = agreedAt;
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });
          }
        }

        await clearSocialConsentCookie();
      }

      return true;
    },
  },
});
