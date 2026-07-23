import { GAME_GUIDES } from '@/content/game-guides';
import { type MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedGames = await prisma.game.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const latestGameUpdatedAt = publishedGames[0]?.updatedAt ?? new Date();
  const editorialUpdatedAt = new Date('2026-07-23T00:00:00.000Z');

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: latestGameUpdatedAt,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: latestGameUpdatedAt,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/rankings`,
      lastModified: latestGameUpdatedAt,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: editorialUpdatedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: editorialUpdatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: editorialUpdatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/editorial-policy`,
      lastModified: editorialUpdatedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: editorialUpdatedAt,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: editorialUpdatedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  const gameEntries: MetadataRoute.Sitemap = publishedGames.map((game) => ({
    url: `${SITE_URL}/games/${game.id}`,
    lastModified: game.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoriesWithGames = await prisma.category.findMany({
    where: {
      isActive: true,
      games: { some: { status: 'PUBLISHED' } },
    },
    select: { code: true, updatedAt: true },
  });

  const categoryEntries: MetadataRoute.Sitemap = categoriesWithGames.map((category) => ({
    url: `${SITE_URL}/games?category=${category.code}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const guideEntries: MetadataRoute.Sitemap = GAME_GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(`${guide.updatedAt}T00:00:00.000Z`),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticEntries, ...gameEntries, ...guideEntries, ...categoryEntries];
}
