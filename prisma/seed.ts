import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genres = [
  { genreCode: 'puzzle', genreName: '퍼즐', description: '논리와 사고력을 요구하는 퍼즐 게임' },
  { genreCode: 'action', genreName: '액션', description: '빠른 반응과 조작이 필요한 액션 게임' },
  { genreCode: 'strategy', genreName: '전략', description: '전략적 사고가 필요한 전략 게임' },
  { genreCode: 'arcade', genreName: '아케이드', description: '클래식 아케이드 스타일의 게임' },
  {
    genreCode: 'adventure',
    genreName: '어드벤처',
    description: '스토리와 탐험 중심의 어드벤처 게임',
  },
  { genreCode: 'sports', genreName: '스포츠', description: '스포츠를 주제로 한 게임' },
];

const main = async (): Promise<void> => {
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { genreCode: genre.genreCode },
      update: {},
      create: genre,
    });
  }

  console.warn(`Seeded ${genres.length} genres`);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
