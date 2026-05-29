import { prisma } from '@/lib/prisma';

export interface AdminCategoryListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  gameCount: number;
}

export const getAdminCategories = async (): Promise<AdminCategoryListItem[]> => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      sortOrder: true,
      isActive: true,
      _count: { select: { games: true } },
    },
  });

  return categories.map(({ _count, ...rest }) => ({
    ...rest,
    gameCount: _count.games,
  }));
};

interface AdminCategoryDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export const getAdminCategoryById = async (id: string): Promise<AdminCategoryDetail | null> => {
  return prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      sortOrder: true,
      isActive: true,
    },
  });
};
