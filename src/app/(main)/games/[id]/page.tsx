import { type Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';
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

  const description = truncateDescription(
    `${game.description} Game Park에서 설치 없이 바로 플레이하는 무료 브라우저 미니게임입니다.`,
    155,
  );
  const images =
    game.thumbnailUrl && game.thumbnailUrl !== DEFAULT_THUMBNAIL ? [game.thumbnailUrl] : [];

  return {
    title: `${game.title} - 설치 없는 브라우저 게임`,
    description,
    alternates: {
      canonical: `/games/${id}`,
    },
    openGraph: {
      title: `${game.title} - 설치 없는 브라우저 게임`,
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
    '@graph': [
      {
        '@type': 'VideoGame',
        name: game.title,
        description: game.description,
        genre: game.category.name,
        gamePlatform: 'Web Browser',
        operatingSystem: 'Any',
        applicationCategory: 'Game',
        playMode: 'SinglePlayer',
        isAccessibleForFree: true,
        inLanguage: 'ko-KR',
        url: `${SITE_URL}/games/${game.id}`,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
        },
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/PlayAction',
            userInteractionCount: game.playCount,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: game.likeCount,
          },
        ],
        ...(game.thumbnailUrl && game.thumbnailUrl !== DEFAULT_THUMBNAIL
          ? { image: game.thumbnailUrl }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '게임',
            item: `${SITE_URL}/games`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: game.title,
            item: `${SITE_URL}/games/${game.id}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
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
