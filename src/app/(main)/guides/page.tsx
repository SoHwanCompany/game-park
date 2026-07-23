import { GAME_GUIDES } from '@/content/game-guides';
import { type Metadata } from 'next';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { SITE_NAME } from '@/lib/site';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '브라우저 게임 플레이 가이드',
  description:
    'Game Park가 직접 정리한 한들, 카붐, 네모네모 퍼즐, 신화 디펜스, 숫자야구의 규칙과 초보 전략을 확인하세요.',
  alternates: {
    canonical: '/guides',
  },
  openGraph: {
    title: `브라우저 게임 플레이 가이드 | ${SITE_NAME}`,
    description: 'Game Park가 직접 정리한 브라우저 게임의 규칙, 조작법, 초보 전략을 확인하세요.',
    url: '/guides',
  },
};

export default async function GuidesPage() {
  const publishedGames = await prisma.game.findMany({
    where: {
      status: 'PUBLISHED',
      code: { in: GAME_GUIDES.map((guide) => guide.gameCode) },
    },
    select: { id: true, code: true },
  });
  const gameIdByCode = new Map(publishedGames.map((game) => [game.code, game.id]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="max-w-3xl space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Game Park 편집 가이드</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          게임을 더 쉽게 시작하는 플레이 가이드
        </h1>
        <p className="text-muted-foreground text-lg leading-8">
          게임 안의 규칙과 조작법을 바탕으로 처음 막히는 지점부터 점수를 높이는 판단 기준까지
          정리했습니다. 짧게 읽고 바로 적용할 수 있는 가이드만 제공합니다.
        </p>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2" aria-label="플레이 가이드 목록">
        {GAME_GUIDES.map((guide) => {
          const gameId = gameIdByCode.get(guide.gameCode);

          return (
            <article key={guide.slug} className="flex flex-col rounded-xl border p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-secondary rounded-full px-2.5 py-1">{guide.difficulty}</span>
                <span className="text-muted-foreground">{guide.readingTime}</span>
                <span className="text-muted-foreground">플레이 {guide.sessionLength}</span>
              </div>
              <h2 className="mt-4 text-xl leading-8 font-semibold">
                <Link href={`/guides/${guide.slug}`} className="hover:underline">
                  {guide.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mt-3 flex-1 leading-7">{guide.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/guides/${guide.slug}`}>가이드 읽기</Link>
                </Button>
                {gameId ? (
                  <Button variant="outline" asChild>
                    <Link href={`/games/${gameId}`}>게임 열기</Link>
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>

      <aside className="bg-muted/40 mt-12 rounded-xl p-6">
        <h2 className="text-lg font-semibold">가이드 작성 원칙</h2>
        <p className="text-muted-foreground mt-2 leading-7">
          화면에 실제로 제공되는 규칙과 기능을 기준으로 설명하고, 확인할 수 없는 공략이나 과장된
          점수 보장은 싣지 않습니다. 게임 내용이 바뀌면 안내도 함께 검토합니다.
        </p>
        <Link
          href="/editorial-policy"
          className="mt-3 inline-block text-sm underline underline-offset-4"
        >
          편집 원칙 자세히 보기
        </Link>
      </aside>
    </main>
  );
}
