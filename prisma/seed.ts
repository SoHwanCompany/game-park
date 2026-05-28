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
    code: 'handle',
    title: '한들',
    description: '한글판 워들입니다.',
    categoryCode: 'puzzle',
    gameUrl: 'https://d2ba9ahp55uzic.cloudfront.net/handle/index.html',
    thumbnailUrl: 'https://d2ba9ahp55uzic.cloudfront.net/handle/assets/marketing/thumbnail.png',
  },
  {
    code: 'kaboom',
    title: '카붐',
    description:
      '실시간으로 진행되는 긴장감 넘치는 지뢰찾기 게임! 숨겨진 지뢰를 피해 안전한 칸을 열어가세요. 클래식 지뢰찾기에 실시간 요소를 더해 한층 스릴 있는 경험을 제공합니다.',
    categoryCode: 'puzzle',
    gameUrl: 'https://d2ba9ahp55uzic.cloudfront.net/kaboom/index.html',
    thumbnailUrl: 'https://d2ba9ahp55uzic.cloudfront.net/kaboom/assets/og-thumbnail.png',
  },
  {
    code: 'nemo-nemo-puzzle',
    title: '네모네모 퍼즐',
    description: '숫자 힌트를 보고 칸을 채워 숨겨진 그림을 완성하는 퍼즐 게임!',
    categoryCode: 'puzzle',
    gameUrl: 'https://d2ba9ahp55uzic.cloudfront.net/nemo-nemo-puzzle/index.html',
    thumbnailUrl: 'https://d2ba9ahp55uzic.cloudfront.net/nemo-nemo-puzzle/assets/thumbnail.png',
  },
  {
    code: 'mythology-defense',
    title: '신화 디펜스',
    description:
      '100라운드의 도전, 5종 맵, 9개 신화 타워와 5종 합성 타워로 적의 침공을 막아내는 전략 디펜스 게임. 업적 시스템과 도전 모드로 무한히 강해지세요.',
    categoryCode: 'strategy',
    gameUrl: 'https://d2ba9ahp55uzic.cloudfront.net/mythology-defense/index.html',
    thumbnailUrl: 'https://d2ba9ahp55uzic.cloudfront.net/mythology-defense/thumbnail.png',
  },
  {
    code: 'number-baseball',
    title: '숫자야구',
    description:
      '야구장에서 펼쳐지는 숫자 추리 게임! 0~9 중 서로 다른 숫자 3개를 7번의 스윙 안에 맞혀보세요. 스트라이크와 볼 힌트로 정답을 좁혀가며 1루타·2루타·홈런으로 진루할 수 있고, 데일리·하프이닝·풀이닝 모드와 도장 수집 업적으로 매일 새로운 도전이 기다립니다.',
    categoryCode: 'puzzle',
    gameUrl: 'https://d2ba9ahp55uzic.cloudfront.net/number-baseball/index.html',
    thumbnailUrl: 'https://d2ba9ahp55uzic.cloudfront.net/number-baseball/thumbnail.png',
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
        thumbnailUrl: game.thumbnailUrl,
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
