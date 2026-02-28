# Game Park MVP - 프로젝트 초기 설정 및 구조 잡기

## Context

게임 플랫폼 "game-park" MVP를 빠르게 배포하기 위한 프로젝트 초기 설정.
현재 상태: `.claude/`, `docs/`, `CLAUDE.md`만 존재. 소스 코드, package.json, 설정 파일 모두 없음.

## 결정 사항

- **i18n**: MVP에서 제외 (`[locale]` 라우팅 없음)
- **인증**: 이메일/비밀번호 + Google + 카카오톡
- **범위**: 설정 + 디렉토리 구조 + Prisma 스키마 + Auth 설정까지 (페이지 UI는 다음 세션)
- **DB**: Neon (PostgreSQL) + Prisma

## 기술 스택

Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Prisma + Neon · Auth.js v5 (NextAuth) · S3 + CloudFront · Vercel

---

## Step 1: 루트 설정 파일 생성

### 1-1. `package.json`

- scripts: dev, build, lint, format, type-check, knip, validate, test, db:\* 등
- prisma seed: `tsx prisma/seed.ts`

### 1-2. 의존성 설치

**Production:**

```
next react react-dom
@prisma/client @neondatabase/serverless @prisma/adapter-neon
next-auth@beta @auth/prisma-adapter
zod react-hook-form @hookform/resolvers
class-variance-authority clsx tailwind-merge
@radix-ui/react-slot
next-auth/providers/kakao (next-auth에 내장)
```

**Dev:**

```
typescript @types/react @types/react-dom @types/node
tailwindcss @tailwindcss/postcss postcss
eslint eslint-config-next typescript-eslint eslint-plugin-import-x eslint-import-resolver-typescript @eslint/js globals
prettier prettier-plugin-tailwindcss @ianvs/prettier-plugin-sort-imports
prisma tsx
vitest @vitejs/plugin-react vite-tsconfig-paths
@testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event happy-dom
husky lint-staged knip
@playwright/test
```

### 1-3. 설정 파일 목록

| 파일                 | 설명                                           |
| -------------------- | ---------------------------------------------- |
| `tsconfig.json`      | path alias 포함 (`@/*`, `@components/*` 등)    |
| `next.config.ts`     | CloudFront 이미지 도메인 허용                  |
| `postcss.config.mjs` | Tailwind CSS 4 (`@tailwindcss/postcss`)        |
| `eslint.config.mjs`  | ESLint 9 flat config, CLAUDE.md 규칙 전부 반영 |
| `.prettierrc`        | CLAUDE.md Prettier 옵션 + import 정렬 플러그인 |
| `.prettierignore`    | node_modules, .next, prisma/migrations         |
| `.gitignore`         | Next.js + Prisma + Playwright + Storybook      |
| `.nvmrc`             | Node 22                                        |
| `vitest.config.ts`   | happy-dom, globals, setup.ts                   |
| `knip.json`          | Next.js entry points, ignore test/stories      |
| `.lintstagedrc.json` | eslint --fix + prettier --write                |
| `.env.example`       | DATABASE_URL, AUTH_SECRET, OAuth, S3 등        |

### 1-4. Husky 설정

- `pnpm exec husky init`
- `.husky/pre-commit`: 브랜치 검증 → .env 방지 → Knip → TypeScript → lint-staged

---

## Step 2: Prisma 스키마

`prisma/schema.prisma`:

- `generator`: previewFeatures = ["driverAdapters"]
- `datasource`: postgresql, url + directUrl
- **Models**: User, Account, Session, VerificationToken (Auth.js 필수) + Category, Game, Review (플랫폼)
- Game: title, slug, description, thumbnail(CloudFront URL), buildUrl(iframe src), categoryId, playCount, isPublished
- Review: rating(1-5), content, userId, gameId, unique(userId+gameId)

`prisma/seed.ts`: 카테고리 샘플 데이터 (퍼즐, 액션, 전략, 아케이드)

---

## Step 3: 소스 디렉토리 구조

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── (auth)/
│   │   ├── login/page.tsx          # placeholder
│   │   ├── register/page.tsx       # placeholder
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── page.tsx                # placeholder (홈)
│   │   ├── games/
│   │   │   ├── page.tsx            # placeholder (게임 목록)
│   │   │   └── [id]/page.tsx       # placeholder (게임 상세)
│   │   └── layout.tsx
│   ├── (fullscreen)/
│   │   ├── play/[id]/page.tsx      # placeholder (iframe 플레이)
│   │   └── layout.tsx
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── not-found.tsx
│   └── globals.css                 # Tailwind 4 @theme
├── components/
│   ├── ui/                         # shadcn (init 후 자동 생성)
│   ├── common/
│   └── layout/
│       ├── header.tsx              # 기본 헤더
│       └── footer.tsx              # 기본 푸터
├── lib/
│   ├── utils.ts                    # cn()
│   ├── prisma.ts                   # Neon adapter + singleton
│   ├── auth.ts                     # Auth.js 설정 (Prisma adapter)
│   └── auth.config.ts              # Auth.js edge-safe 설정
├── hooks/
├── types/
│   └── index.ts
├── constants/
│   └── index.ts
├── assets/
├── styles/
├── stories/
├── mocks/
│   ├── fixtures/
│   └── handlers/
├── i18n/                           # placeholder
└── test/
    ├── setup.ts
    └── vitest.d.ts
```

**placeholder 페이지**: 라우팅만 확인 가능한 최소한의 컴포넌트 (제목만 표시)

---

## Step 4: Auth.js 설정

- `src/lib/auth.config.ts`: providers (Google, Kakao, Credentials), pages, callbacks — edge-safe (adapter 없음)
- `src/lib/auth.ts`: auth.config import + PrismaAdapter 연결, `auth`, `signIn`, `signOut`, `handlers` export
- `src/app/api/auth/[...nextauth]/route.ts`: `{ GET, POST }` re-export
- `src/app/proxy.ts`: Auth.js middleware (구 middleware.ts)

---

## Step 5: shadcn/ui 초기화

- `pnpm dlx shadcn@latest init`
- 기본 컴포넌트만 설치: `button`
- 나머지는 페이지 UI 구현 시 필요할 때 추가

---

## Step 6: 검증

```bash
pnpm type-check     # TypeScript 에러 없음
pnpm lint           # ESLint 통과
pnpm build          # 빌드 성공
pnpm db:generate    # Prisma client 생성
```

---

## 파일 생성 순서 요약

1. `.gitignore`, `.nvmrc`
2. `package.json` → `pnpm install`
3. `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
4. `eslint.config.mjs`, `.prettierrc`, `.prettierignore`
5. `vitest.config.ts`, `knip.json`, `.lintstagedrc.json`
6. `.env.example`
7. Husky init + `.husky/pre-commit`
8. `prisma/schema.prisma`, `prisma/seed.ts`
9. `src/` 전체 디렉토리 + 파일 생성
10. `pnpm dlx shadcn@latest init` + button 설치
11. `pnpm db:generate`
12. `pnpm lint:fix && pnpm format`
13. 검증: `pnpm type-check && pnpm build`
