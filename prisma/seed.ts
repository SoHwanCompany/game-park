import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: '퍼즐', slug: 'puzzle' },
  { name: '액션', slug: 'action' },
  { name: '전략', slug: 'strategy' },
  { name: '아케이드', slug: 'arcade' },
  { name: '어드벤처', slug: 'adventure' },
  { name: '스포츠', slug: 'sports' },
];

const main = async (): Promise<void> => {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
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
