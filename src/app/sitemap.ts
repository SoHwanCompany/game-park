import { type MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://game-park.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/games`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const publishedGames = await prisma.game.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, updatedAt: true },
  });

  const gameEntries: MetadataRoute.Sitemap = publishedGames.map((game) => ({
    url: `${BASE_URL}/games/${game.id}`,
    lastModified: game.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoriesWithGames = await prisma.category.findMany({
    where: {
      isActive: true,
      games: { some: { status: 'PUBLISHED' } },
    },
    select: { code: true },
  });

  const categoryEntries: MetadataRoute.Sitemap = categoriesWithGames.map((category) => ({
    url: `${BASE_URL}/games?category=${category.code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...gameEntries, ...categoryEntries];
}
