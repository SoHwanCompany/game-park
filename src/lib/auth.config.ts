import { type UserRole } from '@prisma/client';
import { type NextAuthConfig } from 'next-auth';
import Kakao from 'next-auth/providers/kakao';

export const authConfig = {
  providers: [
    Kakao({
      clientId: process.env.AUTH_KAKAO_ID,
      clientSecret: process.env.AUTH_KAKAO_SECRET,
      authorization: 'https://kauth.kakao.com/oauth/authorize?scope=profile_nickname+profile_image',
      checks: ['state'],
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;

        if (user.role) {
          token.role = user.role;
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      if (token.id) {
        session.user.id = token.id as string;
      }

      if (token.role) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = Boolean(auth?.user);
      const isAdminPath = nextUrl.pathname.startsWith('/admin');

      if (isAdminPath) {
        return auth?.user?.role === 'ADMIN';
      }

      const protectedPaths = ['/mypage'];
      const isProtected = protectedPaths.some((path) => nextUrl.pathname.startsWith(path));

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
