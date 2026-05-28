import Link from 'next/link';

import { getRankingGameOptions } from '@/lib/admin/rankings';
import { Button } from '@/components/ui/button';

export default async function AdminRankingsIndexPage() {
  const games = await getRankingGameOptions();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">랭킹 관리</h2>
      <p className="text-muted-foreground text-sm">
        관리할 게임을 선택하세요. 부정 점수 행 제거나 이벤트 종료 후 전체 리셋이 가능합니다.
      </p>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-muted-foreground text-left text-xs font-medium">
              <th className="px-4 py-3">코드</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-right">진입자 수</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {games.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                  관리 가능한 게임이 없습니다.
                </td>
              </tr>
            ) : (
              games.map((game) => (
                <tr key={game.id}>
                  <td className="text-muted-foreground px-4 py-2 font-mono text-xs">{game.code}</td>
                  <td className="px-4 py-2 font-medium">{game.title}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {game.rankedPlayers.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/rankings/${game.id}`}>관리</Link>
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
