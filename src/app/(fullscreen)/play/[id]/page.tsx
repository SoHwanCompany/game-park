import { redirect } from 'next/navigation';

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { id } = await params;

  redirect(`/games/${id}`);
}
