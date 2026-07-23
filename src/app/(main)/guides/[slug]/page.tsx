import { GAME_GUIDES, getGameGuideBySlug } from '@/content/game-guides';
import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { serializeJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { Button } from '@/components/ui/button';

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const generateStaticParams = () => {
  return GAME_GUIDES.map((guide) => ({ slug: guide.slug }));
};

export const generateMetadata = async ({ params }: GuideDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const guide = getGameGuideBySlug(slug);

  if (!guide) {
    return {
      title: '가이드를 찾을 수 없습니다',
    };
  }

  return {
    title: guide.title,
    description: guide.summary,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      type: 'article',
      title: guide.title,
      description: guide.summary,
      url: `/guides/${guide.slug}`,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
};

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const guide = getGameGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const game = await prisma.game.findFirst({
    where: { code: guide.gameCode, status: 'PUBLISHED' },
    select: { id: true, title: true },
  });
  const guideUrl = `${SITE_URL}/guides/${guide.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.summary,
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        inLanguage: 'ko-KR',
        mainEntityOfPage: guideUrl,
        author: {
          '@type': 'Organization',
          name: `${SITE_NAME} 편집팀`,
          url: `${SITE_URL}/about`,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/images/logo.png`,
          },
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '플레이 가이드',
            item: `${SITE_URL}/guides`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: guideUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <nav aria-label="현재 위치" className="text-muted-foreground text-sm">
        <Link href="/guides" className="hover:text-foreground">
          플레이 가이드
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{game?.title ?? guide.title}</span>
      </nav>

      <article className="mt-6">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{guide.title}</h1>
          <p className="text-muted-foreground text-lg leading-8">{guide.summary}</p>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span>Game Park 편집팀</span>
            <span>업데이트 {guide.updatedAt}</span>
            <span>{guide.readingTime}</span>
          </div>
        </header>

        <section className="bg-muted/40 mt-8 rounded-xl p-6" aria-label="가이드 요약">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-sm">난이도</dt>
              <dd className="mt-1 font-medium">{guide.difficulty}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">예상 플레이 시간</dt>
              <dd className="mt-1 font-medium">{guide.sessionLength}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-sm">이런 분께 추천</dt>
              <dd className="mt-1 font-medium">{guide.recommendedFor}</dd>
            </div>
          </dl>
        </section>

        <p className="mt-8 text-lg leading-8">{guide.description}</p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">먼저 기억할 네 가지</h2>
          <ol className="mt-4 space-y-3">
            {guide.keyPoints.map((point, index) => (
              <li key={point} className="flex gap-3 leading-7">
                <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ol>
        </section>

        {guide.sections.map((section) => (
          <section key={section.title} className="mt-10">
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <div className="mt-4 space-y-4 leading-8">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">실전 팁</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {guide.tips.map((tip) => (
              <div key={tip.title} className="rounded-lg border p-5">
                <h3 className="font-semibold">{tip.title}</h3>
                <p className="text-muted-foreground mt-2 leading-7">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">자주 묻는 질문</h2>
          <div className="mt-4 space-y-4">
            {guide.faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border p-5">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground mt-2 leading-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap gap-3 border-t pt-8">
          {game ? (
            <Button asChild>
              <Link href={`/games/${game.id}`}>{game.title} 플레이하기</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/guides">다른 가이드 보기</Link>
          </Button>
        </footer>
      </article>
    </main>
  );
}
