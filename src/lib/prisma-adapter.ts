import { type Adapter, type AdapterUser } from 'next-auth/adapters';

import { prisma } from '@/lib/prisma';

const toAdapterUser = (user: {
  id: string;
  email: string;
  nickname: string;
  profileUrl: string | null;
  emailVerifiedAt: Date | null;
}): AdapterUser => ({
  id: user.id,
  email: user.email,
  name: user.nickname,
  image: user.profileUrl,
  emailVerified: user.emailVerifiedAt,
});

const generateUniqueNickname = async (baseName: string): Promise<string> => {
  const nickname = baseName.slice(0, 42);

  const existing = await prisma.user.findUnique({ where: { nickname } });

  if (!existing) {
    return nickname;
  }

  const suffix = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');

  return `${nickname.slice(0, 44)}_${suffix}`;
};

export const createCustomAdapter = (): Adapter => ({
  createUser: async (data) => {
    const nickname = await generateUniqueNickname(data.name ?? `user_${Date.now()}`);
    const email = data.email ?? `kakao_${Date.now()}@kakao.user`;

    const user = await prisma.user.create({
      data: {
        email,
        nickname,
        profileUrl: data.image ?? null,
        emailVerifiedAt: data.emailVerified ?? null,
      },
    });

    return toAdapterUser(user);
  },

  getUser: async (id) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return null;
    }

    return toAdapterUser(user);
  },

  getUserByEmail: async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    return toAdapterUser(user);
  },

  getUserByAccount: async ({ provider, providerAccountId }) => {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });

    if (!account?.user) {
      return null;
    }

    return toAdapterUser(account.user);
  },

  updateUser: async ({ id, ...data }) => {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== null && data.name !== undefined && { nickname: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.image !== undefined && { profileUrl: data.image }),
        ...(data.emailVerified !== undefined && { emailVerifiedAt: data.emailVerified }),
      },
    });

    return toAdapterUser(user);
  },

  deleteUser: async (id) => {
    await prisma.user.delete({ where: { id } });
  },

  linkAccount: async (data) => {
    await prisma.account.create({ data });
  },

  unlinkAccount: async ({ provider, providerAccountId }) => {
    await prisma.account.delete({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });
  },

  getSessionAndUser: async (sessionToken) => {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    return {
      session: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      },
      user: toAdapterUser(session.user),
    };
  },

  createSession: async (data) => {
    const session = await prisma.session.create({ data });

    return session;
  },

  updateSession: async ({ sessionToken, ...data }) => {
    const session = await prisma.session.update({
      where: { sessionToken },
      data,
    });

    return session;
  },

  deleteSession: async (sessionToken) => {
    await prisma.session.delete({ where: { sessionToken } });
  },

  createVerificationToken: async (data) => {
    const token = await prisma.verificationToken.create({ data });

    return token;
  },

  useVerificationToken: async ({ identifier, token }) => {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier, token } },
    });

    if (!verificationToken) {
      return null;
    }

    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token } },
    });

    return verificationToken;
  },
});
