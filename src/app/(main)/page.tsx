import { type Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { serializeJsonLd } from '@/lib/seo';
import {
  SEO_FAQS,
  SITE_DESCRIPTION,
  SITE_HERO_DESCRIPTION,
  SITE_HERO_TITLE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site';
import { DEFAULT_THUMBNAIL } from '@/constants/game';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  alternates: {
    canonical: '/',
  },
};

const getPopularGames = unstable_cache(
  async () => {
    return prisma.game.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { playCount: 'desc' },
      take: 4,
      include: { category: { select: { name: true } } },
    });
  },
  ['popular-games'],
  { revalidate: 60, tags: ['games'] },
);

export default async function HomePage() {
  const popularGames = await getPopularGames();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: ['게임파크', SITE_TAGLINE],
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: SEO_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <section className="max-w-3xl space-y-5">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">{SITE_TAGLINE}</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{SITE_HERO_TITLE}</h1>
          <p className="text-muted-foreground text-lg leading-8">{SITE_HERO_DESCRIPTION}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['직장인 심심할 때', '설치 없는 게임', '쉬는 시간 미니게임', '월루 게임'].map(
            (keyword) => (
              <span
                key={keyword}
                className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
              >
                {keyword}
              </span>
            ),
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/games">바로 게임하기</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/rankings">랭킹 보기</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            title: '점심시간에 짧게',
            description: '긴 튜토리얼 없이 바로 시작하는 브라우저 미니게임을 모았습니다.',
          },
          {
            title: '설치 없이 가볍게',
            description: '회사 PC에서도 다운로드 없이 웹에서 바로 열고 플레이할 수 있습니다.',
          },
          {
            title: '랭킹으로 동기부여',
            description: '짧게 즐기면서 최고 점수에 도전하고 인기 게임을 빠르게 찾으세요.',
          },
        ].map((item) => (
          <article key={item.title} className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{item.description}</p>
          </article>
        ))}
      </section>

      {popularGames.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">지금 하기 좋은 인기 미니게임</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                직장인 쉬는 시간에 부담 없이 시작하기 좋은 게임입니다.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/games">전체보기</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={game.thumbnailUrl || DEFAULT_THUMBNAIL}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <h3 className="truncate font-semibold">{game.title}</h3>
                  <span className="text-muted-foreground text-xs">{game.category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-bold">자주 묻는 질문</h2>
          <p className="text-muted-foreground text-sm">
            Game Park를 처음 찾는 직장인 사용자가 자주 묻는 질문입니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SEO_FAQS.map((faq) => (
            <article key={faq.question} className="rounded-lg border p-5">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
