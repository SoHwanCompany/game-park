import Image from 'next/image';
import Link from 'next/link';

import { getAdminGames } from '@/lib/admin/games';
import { Button } from '@/components/ui/button';
import { GameStatusSelect } from '@/app/(admin)/_components/game-status-select';

export default async function AdminGamesPage() {
  const games = await getAdminGames();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">게임 관리</h2>
        <Button asChild>
          <Link href="/admin/games/new">게임 등록</Link>
        </Button>
      </div>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-muted-foreground text-left text-xs font-medium">
              <th className="px-4 py-3">썸네일</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">플레이</th>
              <th className="px-4 py-3 text-right">좋아요</th>
              <th className="px-4 py-3">등록일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {games.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted-foreground px-4 py-8 text-center">
                  등록된 게임이 없습니다.
                </td>
              </tr>
            ) : (
              games.map((game) => (
                <tr key={game.id}>
                  <td className="px-4 py-2">
                    <div className="relative h-10 w-16 overflow-hidden rounded">
                      <Image
                        src={game.thumbnailUrl}
                        alt={game.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">{game.title}</td>
                  <td className="text-muted-foreground px-4 py-2">{game.category.name}</td>
                  <td className="px-4 py-2">
                    <GameStatusSelect gameId={game.id} status={game.status} />
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {game.playCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {game.likeCount.toLocaleString()}
                  </td>
                  <td className="text-muted-foreground px-4 py-2">
                    {new Date(game.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/games/${game.id}`}>편집</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
