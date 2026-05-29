import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getRankingPageData } from '@/lib/admin/rankings';
import { Button } from '@/components/ui/button';

import { DeleteRankingRowButton } from '../_components/delete-ranking-row-button';
import { ResetLeaderboardForm } from '../_components/reset-leaderboard-form';

interface AdminRankingPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function AdminRankingPage({ params }: AdminRankingPageProps) {
  const { gameId } = await params;
  const data = await getRankingPageData(gameId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{data.game.title} 랭킹</h2>
          <p className="text-muted-foreground text-xs">{data.game.code}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/games/${data.game.id}/stats`}>통계</Link>
        </Button>
      </div>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-muted-foreground text-left text-xs font-medium">
              <th className="px-4 py-3 text-right">순위</th>
              <th className="px-4 py-3">닉네임</th>
              <th className="px-4 py-3 text-right">점수</th>
              <th className="px-4 py-3">최근 갱신</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                  랭킹 기록이 없습니다.
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.userId}>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{row.rank}</td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/users/${row.userId}`} className="hover:underline">
                      {row.nickname}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {row.score.toLocaleString()}
                  </td>
                  <td className="text-muted-foreground px-4 py-2 text-xs">
                    {new Date(row.updatedAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <DeleteRankingRowButton
                      gameId={data.game.id}
                      userId={row.userId}
                      nickname={row.nickname}
                      score={row.score}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="border-destructive/30 rounded-lg border p-4">
        <h3 className="text-destructive mb-3 text-sm font-semibold">위험 영역</h3>
        <ResetLeaderboardForm gameId={data.game.id} gameTitle={data.game.title} />
      </section>
    </div>
  );
}
