import { type Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { FeedbackForm } from '../_components/feedback-form';

export const metadata: Metadata = {
  title: '의견 작성',
};

export default async function FeedbackNewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

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

      <FeedbackForm />
    </div>
  );
}
