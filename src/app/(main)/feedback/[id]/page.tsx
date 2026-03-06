import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { CommentSection } from '../_components/comment-section';
import { FeedbackDetailView } from '../_components/feedback-detail-view';

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

const generateMetadata = async ({ params }: FeedbackDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: feedback?.title ?? '의견 상세',
  };
};

export { generateMetadata };

export default async function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      customCategory: true,
      isPublic: true,
      createdAt: true,
      user: { select: { id: true, nickname: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, nickname: true } },
        },
      },
    },
  });

  if (!feedback) {
    notFound();
  }

  if (!feedback.isPublic) {
    const isOwner = currentUserId === feedback.user.id;
    const isAdmin = currentUserId
      ? (
          await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { role: true },
          })
        )?.role === 'ADMIN'
      : false;

    if (!isOwner && !isAdmin) {
      notFound();
    }
  }

  const serialized = {
    ...feedback,
    createdAt: new Date(feedback.createdAt).toISOString(),
    comments: feedback.comments.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt).toISOString(),
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/feedback"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        의견 게시판
      </Link>

      <FeedbackDetailView feedback={serialized} currentUserId={currentUserId} />

      <CommentSection
        feedbackId={id}
        comments={serialized.comments}
        currentUserId={currentUserId}
      />
    </div>
  );
}
