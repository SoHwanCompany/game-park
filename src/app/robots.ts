import { type MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://game-park.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/mypage', '/login', '/register', '/play/', '/admin/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
