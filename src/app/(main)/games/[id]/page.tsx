import { type Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { DEFAULT_THUMBNAIL } from '@/constants/game';
import { GamePlayer } from '@/components/game/game-player';

import { LikeButton } from '../_components/like-button';
import { UserRankingSection } from './_components/user-ranking-section';

const getGame = unstable_cache(
  async (id: string) => {
    return prisma.game.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: { category: { select: { code: true, name: true } } },
    });
  },
  ['game-detail'],
  { revalidate: 60, tags: ['games'] },
);

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

const truncateDescription = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

const generateMetadata = async ({ params }: GameDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  const game = await prisma.game.findFirst({
    where: { id, status: 'PUBLISHED' },
    select: { title: true, description: true, thumbnailUrl: true },
  });

  if (!game) {
    return {
      title: '게임을 찾을 수 없습니다',
    };
  }

  const description = truncateDescription(game.description, 155);
  const images =
    game.thumbnailUrl && game.thumbnailUrl !== DEFAULT_THUMBNAIL ? [game.thumbnailUrl] : [];

  return {
    title: game.title,
    description,
    alternates: {
      canonical: `/games/${id}`,
    },
    openGraph: {
      title: game.title,
      description,
      url: `/games/${id}`,
      ...(images.length > 0 ? { images } : {}),
    },
  };
};

export { generateMetadata };

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  const game = await getGame(id);

  if (!game) {
    notFound();
  }

  const isLiked = session?.user?.id
    ? (await prisma.gameLike.count({ where: { userId: session.user.id, gameId: game.id } })) > 0
    : false;

  let userInfo: { userId: string; nickname: string } | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, nickname: true },
    });

    if (user) {
      userInfo = { userId: user.id, nickname: user.nickname };
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description,
    genre: game.category.name,
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    playMode: 'SinglePlayer',
    url: `${SITE_URL}/games/${game.id}`,
    ...(game.thumbnailUrl && game.thumbnailUrl !== DEFAULT_THUMBNAIL
      ? { image: game.thumbnailUrl }
      : {}),
    ...(game.likeCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Math.min(5, Math.max(1, Math.round((game.likeCount / 10) * 4) + 1)),
            bestRating: 5,
            worstRating: 1,
            ratingCount: game.likeCount,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GamePlayer
        gameUrl={game.gameUrl}
        gameTitle={game.title}
        gameId={game.id}
        userId={userInfo?.userId ?? null}
        nickname={userInfo?.nickname ?? null}
      />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{game.title}</h1>
            <span className="bg-secondary text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
              {game.category.name}
            </span>
          </div>
          <p className="text-muted-foreground">{game.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="text-muted-foreground text-sm">플레이 {game.playCount}회</span>
          <LikeButton
            gameId={game.id}
            initialLikeCount={game.likeCount}
            initialIsLiked={isLiked}
            isLoggedIn={Boolean(session?.user)}
          />
        </div>
      </div>

      <UserRankingSection gameId={game.id} />
    </div>
  );
}
