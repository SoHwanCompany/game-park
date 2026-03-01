import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL ?? '';
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const categories = [
  { code: 'puzzle', name: '퍼즐' },
  { code: 'action', name: '액션' },
  { code: 'strategy', name: '전략' },
  { code: 'arcade', name: '아케이드' },
  { code: 'adventure', name: '어드벤처' },
  { code: 'sports', name: '스포츠' },
];

const games = [
  {
    code: 'tetris-classic',
    title: '테트리스 클래식',
    description: '클래식 테트리스 게임입니다. 블록을 쌓아 줄을 완성하세요!',
    categoryCode: 'puzzle',
    gameUrl: 'https://example.com/games/tetris',
  },
  {
    code: 'sudoku-master',
    title: '스도쿠 마스터',
    description: '숫자 퍼즐의 정석, 스도쿠에 도전하세요.',
    categoryCode: 'puzzle',
    gameUrl: 'https://example.com/games/sudoku',
  },
  {
    code: 'space-invaders',
    title: '스페이스 인베이더',
    description: '외계인의 침공을 막아라! 레트로 슈팅 게임입니다.',
    categoryCode: 'action',
    gameUrl: 'https://example.com/games/space-invaders',
  },
  {
    code: 'ninja-run',
    title: '닌자 런',
    description: '닌자가 되어 장애물을 피하며 달려보세요!',
    categoryCode: 'action',
    gameUrl: 'https://example.com/games/ninja-run',
  },
  {
    code: 'chess-online',
    title: '체스 온라인',
    description: '전략적 사고를 요하는 클래식 체스 게임입니다.',
    categoryCode: 'strategy',
    gameUrl: 'https://example.com/games/chess',
  },
  {
    code: 'tower-defense',
    title: '타워 디펜스',
    description: '타워를 배치하고 적의 침공을 막아내세요.',
    categoryCode: 'strategy',
    gameUrl: 'https://example.com/games/tower-defense',
  },
  {
    code: 'pac-man',
    title: '팩맨',
    description: '미로를 돌아다니며 모든 점을 먹어치우세요!',
    categoryCode: 'arcade',
    gameUrl: 'https://example.com/games/pacman',
  },
  {
    code: 'breakout',
    title: '벽돌깨기',
    description: '공을 튕겨 모든 벽돌을 깨부수세요!',
    categoryCode: 'arcade',
    gameUrl: 'https://example.com/games/breakout',
  },
  {
    code: 'dungeon-crawler',
    title: '던전 크롤러',
    description: '미지의 던전을 탐험하고 보물을 찾아보세요.',
    categoryCode: 'adventure',
    gameUrl: 'https://example.com/games/dungeon',
  },
  {
    code: 'penalty-kick',
    title: '페널티 킥',
    description: '골키퍼를 속이고 골을 넣어보세요!',
    categoryCode: 'sports',
    gameUrl: 'https://example.com/games/penalty',
  },
];

const main = async (): Promise<void> => {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: {},
      create: category,
    });
  }

  console.warn(`Seeded ${categories.length} categories`);

  const categoryMap = new Map<string, string>();
  const allCategories = await prisma.category.findMany({ select: { id: true, code: true } });

  for (const cat of allCategories) {
    categoryMap.set(cat.code, cat.id);
  }

  for (const game of games) {
    const categoryId = categoryMap.get(game.categoryCode);

    if (!categoryId) {
      continue;
    }

    await prisma.game.upsert({
      where: { code: game.code },
      update: {},
      create: {
        code: game.code,
        title: game.title,
        description: game.description,
        thumbnailUrl: '/images/games/default-thumbnail.svg',
        gameUrl: game.gameUrl,
        categoryId,
        status: 'PUBLISHED',
      },
    });
  }

  console.warn(`Seeded ${games.length} games`);
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
