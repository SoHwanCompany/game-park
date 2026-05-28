import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getAdminGameById, getGameStats } from '@/lib/admin/games';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/app/(admin)/_components/kpi-card';

import { GameTimeseriesChart } from '../../_components/game-timeseries-chart';

interface AdminGameStatsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminGameStatsPage({ params }: AdminGameStatsPageProps) {
  const { id } = await params;
  const [game, stats] = await Promise.all([getAdminGameById(id), getGameStats(id)]);

  if (!game || !stats) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{game.title} 통계</h2>
          <p className="text-muted-foreground text-xs">
            {game.code} · 등록 후 누적 + 최근 30일 추이
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/games/${game.id}`}>편집으로</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="누적 플레이" value={stats.totals.playCount} />
        <KpiCard label="누적 좋아요" value={stats.totals.likeCount} />
        <KpiCard label="리더보드 진입" value={stats.totals.rankedPlayers} />
        <KpiCard label="평균 점수" value={Math.round(stats.totals.averageScore ?? 0)} />
      </section>

      <section className="bg-card rounded-lg border p-4">
        <h3 className="mb-4 text-sm font-semibold">최근 30일 추이</h3>
        <GameTimeseriesChart data={stats.timeseries} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">리더보드 Top 50</h3>
        {stats.topRankings.length === 0 ? (
          <p className="text-muted-foreground text-sm">기록 없음</p>
        ) : (
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
                {stats.topRankings.map((row) => (
                  <tr key={row.userId}>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">{row.rank}</td>
                    <td className="px-4 py-2">{row.nickname}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {row.score.toLocaleString()}
                    </td>
                    <td className="text-muted-foreground px-4 py-2 text-xs">
                      {new Date(row.updatedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/users/${row.userId}`}>유저</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/rankings/${game.id}`}>랭킹 관리</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
