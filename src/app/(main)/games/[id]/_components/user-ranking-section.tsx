import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type UserRankingItem } from '@/types/ranking';
import { USER_RANKING_LIMIT } from '@/constants/ranking';

import { UserRankingList } from './user-ranking-list';

interface UserRankingSectionProps {
  gameId: string;
}

const resolveCurrentUserRank = async (
  currentUserId: string,
  rankings: UserRankingItem[],
  gameId: string,
): Promise<UserRankingItem | null> => {
  const inList = rankings.find((r) => r.userId === currentUserId);

  if (inList) {
    return null;
  }

  const userRanking = await prisma.ranking.findUnique({
    where: { userId_gameId: { userId: currentUserId, gameId } },
    select: {
      score: true,
      updatedAt: true,
      user: { select: { nickname: true, profileUrl: true } },
    },
  });

  if (!userRanking) {
    return null;
  }

  const higherCount = await prisma.ranking.count({
    where: {
      gameId,
      OR: [
        { score: { gt: userRanking.score } },
        {
          score: userRanking.score,
          updatedAt: { lt: userRanking.updatedAt },
        },
      ],
    },
  });

  return {
    rank: higherCount + 1,
    userId: currentUserId,
    nickname: userRanking.user.nickname,
    profileUrl: userRanking.user.profileUrl,
    score: userRanking.score,
    updatedAt: userRanking.updatedAt.toISOString(),
  };
};

export const UserRankingSection = async ({ gameId }: UserRankingSectionProps) => {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  const topRankings = await prisma.ranking.findMany({
    where: { gameId },
    orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
    take: USER_RANKING_LIMIT,
    select: {
      userId: true,
      score: true,
      updatedAt: true,
      user: { select: { nickname: true, profileUrl: true } },
    },
  });

  const rankings: UserRankingItem[] = topRankings.map((r, index) => ({
    rank: index + 1,
    userId: r.userId,
    nickname: r.user.nickname,
    profileUrl: r.user.profileUrl,
    score: r.score,
    updatedAt: r.updatedAt.toISOString(),
  }));

  const currentUserRank = currentUserId
    ? await resolveCurrentUserRank(currentUserId, rankings, gameId)
    : null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-bold">유저 랭킹</h2>
      <UserRankingList
        rankings={rankings}
        currentUserId={currentUserId}
        currentUserRank={currentUserRank}
      />
    </section>
  );
};
