import { getAdminOverview } from '@/lib/admin/stats';
import { KpiCard } from '@/app/(admin)/_components/kpi-card';

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">대시보드</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="전체 회원" value={overview.totalUsers} />
        <KpiCard label="오늘 신규 가입" value={overview.newUsersToday} />
        <KpiCard label="오늘 신규 좋아요" value={overview.newLikesToday} />
        <KpiCard label="대기 피드백" value={overview.pendingFeedbacks} />
        <KpiCard label="미처리 신고" value={overview.pendingReports} />
      </div>
    </div>
  );
}
