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
      <FeedbackForm />
    </div>
  );
}
