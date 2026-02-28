import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { code: 'puzzle', name: '퍼즐' },
  { code: 'action', name: '액션' },
  { code: 'strategy', name: '전략' },
  { code: 'arcade', name: '아케이드' },
  { code: 'adventure', name: '어드벤처' },
  { code: 'sports', name: '스포츠' },
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
