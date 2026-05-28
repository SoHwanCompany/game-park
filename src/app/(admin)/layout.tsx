import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE' || user.role !== 'ADMIN') {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Game Park Admin</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
