import {
  getAdminOverview,
  getDailyTimeseries,
  getMostReportedTargets,
  getTopPlayedGames,
  getTrendingLikedGames,
} from '@/lib/admin/stats';
import { getOperationsStatus } from '@/lib/operations';
import { KpiCard } from '@/app/(admin)/_components/kpi-card';
import { OperationsStatusSection } from '@/app/(admin)/_components/operations-status-section';
import { TimeseriesChart } from '@/app/(admin)/_components/timeseries-chart';
import { TopListSection } from '@/app/(admin)/_components/top-list-section';

export default async function AdminDashboardPage() {
  const operations = getOperationsStatus();

  const [overview, topPlayed, trending, reported, timeseries] = await Promise.all([
    getAdminOverview(),
    getTopPlayedGames(),
    getTrendingLikedGames(),
    getMostReportedTargets(),
    getDailyTimeseries(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-bold">대시보드</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
          <KpiCard label="전체 회원" value={overview.totalUsers} />
          <KpiCard label="오늘 신규 가입" value={overview.newUsersToday} />
          <KpiCard label="오늘 플레이" value={overview.playsToday} />
          <KpiCard label="오늘 활성 회원" value={overview.activePlayersToday} />
          <KpiCard label="오늘 신규 좋아요" value={overview.newLikesToday} />
          <KpiCard label="대기 피드백" value={overview.pendingFeedbacks} />
          <KpiCard label="미처리 신고" value={overview.pendingReports} />
        </div>
      </section>

      <OperationsStatusSection tools={operations.tools} />

      <section className="bg-card rounded-lg border p-4">
        <h3 className="mb-4 text-sm font-semibold">최근 30일 활동</h3>
        <TimeseriesChart data={timeseries} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TopListSection
          title="가장 많이 플레이된 게임 Top 10"
          items={topPlayed.map((game) => ({
            key: game.id,
            primary: game.title,
            secondary: `${game.playCount.toLocaleString()} 회`,
          }))}
        />
        <TopListSection
          title="좋아요 급상승 (최근 7일) Top 10"
          items={trending.map((game) => ({
            key: game.id,
            primary: game.title,
            secondary: `+${game.recentLikes.toLocaleString()}`,
          }))}
          emptyMessage="최근 7일간 신규 좋아요 없음"
        />
        <TopListSection
          title="신고 누적 (미처리) Top 10"
          items={reported.map((target) => ({
            key: `${target.targetType}-${target.targetId}`,
            primary: `${target.targetType === 'FEEDBACK' ? '피드백' : '댓글'} · ${target.targetId.slice(0, 8)}…`,
            secondary: `${target.reportCount} 건`,
          }))}
          emptyMessage="처리 대기 신고 없음"
        />
      </section>
    </div>
  );
}
