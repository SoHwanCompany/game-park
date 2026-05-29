import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { AdminSidebar } from './_components/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, nickname: true },
  });

  if (!user || user.status !== 'ACTIVE' || user.role !== 'ADMIN') {
    notFound();
  }

  const [pendingFeedbackCount, pendingReportCount] = await Promise.all([
    prisma.feedback.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar
        pendingFeedbackCount={pendingFeedbackCount}
        pendingReportCount={pendingReportCount}
      />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h1 className="text-lg font-semibold">Game Park Admin</h1>
          <p className="text-muted-foreground text-sm">{user.nickname}</p>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
