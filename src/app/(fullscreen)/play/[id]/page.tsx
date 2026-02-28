interface PlayPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="text-muted-foreground">게임 플레이 (iframe) - ID: {id}</p>
    </div>
  );
}
