interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold">게임 상세</h1>
      <p className="text-muted-foreground mt-4">게임 ID: {id}</p>
    </div>
  );
}
