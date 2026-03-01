import Image from 'next/image';
import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { DEFAULT_THUMBNAIL } from '@/constants/game';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const popularGames = await prisma.game.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { playCount: 'desc' },
    take: 4,
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Game Park</h1>
        <p className="text-muted-foreground text-lg">다양한 웹 게임을 즐길 수 있는 플랫폼</p>
      </div>

      {popularGames.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">인기 게임</h2>
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
    </div>
  );
}
