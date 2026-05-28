import { prisma } from '@/lib/prisma';

import { GameForm } from '../_components/game-form';

export default async function AdminNewGamePage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">게임 등록</h2>
      <GameForm mode="create" categories={categories} />
    </div>
  );
}
