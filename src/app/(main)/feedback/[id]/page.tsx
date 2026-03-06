import { type Metadata } from 'next';
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
      <FeedbackDetailView feedback={serialized} currentUserId={currentUserId} />

      <CommentSection
        feedbackId={id}
        comments={serialized.comments}
        currentUserId={currentUserId}
      />
    </div>
  );
}
