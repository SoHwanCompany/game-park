import { type Metadata } from 'next';
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
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">의견 작성</h1>
        <p className="text-muted-foreground">Game Park에 대한 의견을 남겨주세요.</p>
      </div>

      <FeedbackForm />
    </div>
  );
}
