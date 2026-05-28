import path from 'node:path';

import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: databaseUrl,
  },
  migrate: {
    url: process.env.DIRECT_DATABASE_URL ?? databaseUrl,
  },
});
