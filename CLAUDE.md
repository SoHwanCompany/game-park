# CLAUDE.md

코드 작성 시 이 파일의 규칙을 따른다.

## 프로젝트 개요

Game Park는 브라우저 기반 웹 게임 플랫폼이다.

- 게임은 별도 React 레포에서 제작 → S3 업로드 → CloudFront CDN → iframe으로 플랫폼에 로드
- 디자이너가 없어 AI 주도 UI 워크플로우 사용 (`/code:design`, `docs/design-system.md`)
- 게임-플랫폼 간 postMessage API로 통신 (`docs/game-integration.md`)

> **코드 작업 프로토콜** — 코드를 생성·수정할 때 반드시 따른다:
>
> 1. `docs/coding-conventions.md`를 **Read 도구로 읽는다** (코드 예시·상세 규칙 확인)
> 2. 테스트 작성 시 `docs/testing.md`도 **Read 도구로 읽는다**
> 3. 이 파일의 규칙과 대조하며 코드를 작성한다
> 4. 코드 작성이 끝나면 `pnpm lint:fix && pnpm format`을 실행한다
> 5. 에러가 있으면 수정 후 4번을 반복한다. 에러가 없을 때까지 반복한다

## 기술 스택

Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS 4 · Radix UI + shadcn/ui · React Hook Form + Zod · Vitest + RTL · Storybook 10 · ESLint 9 · Prettier 3 · Husky 9 · Knip 5

## 스크립트

```bash
pnpm dev              # 개발 서버 (Turbopack)
pnpm build            # 프로덕션 빌드
pnpm lint             # ESLint 검사
pnpm lint:fix         # ESLint 자동 수정
pnpm format           # Prettier 포맷팅
pnpm type-check       # TypeScript 타입 검사
pnpm knip             # 미사용 코드 검사
pnpm validate         # 전체 검사 (type-check + lint + knip)
pnpm storybook        # Storybook (port 6006)
pnpm test             # Vitest 테스트
```

### E2E 테스트 (Playwright)

```bash
pnpm test:e2e          # Headless 실행 (CI와 동일)
pnpm test:e2e:ui       # UI 모드 — 브라우저 화면 + step별 시간여행 디버깅 (추천)
pnpm test:e2e:headed   # 실제 Chrome 창이 열리며 실행
pnpm test:e2e:report   # 마지막 테스트 결과 HTML 리포트 열기
```

## 데이터 모델

| 모델    | 설명                   | PK / 주요 키                                                |
| ------- | ---------------------- | ----------------------------------------------------------- |
| User    | 사용자 (Auth.js)       | `id` (PK), `userId`·`nickname` (UK)                         |
| Genre   | 게임 장르              | `id` (PK), `genreCode` (UK)                                 |
| Game    | 게임                   | `id` (PK), `gameCode` (UK), `genreCode` (FK→Genre)          |
| Like    | 좋아요                 | `[userId, gameId]` (복합 PK)                                |
| Rank    | 리더보드               | `[gameId, userId]` (복합 PK), `[gameId, score DESC]` 인덱스 |
| History | 이벤트 로그 (비정규화) | `id` (PK), FK 관계 없음                                     |

스키마: `prisma/schema.prisma` · 시드: `prisma/seed.ts`

## 게임 통합

- **URL**: Game 테이블의 `url` 필드에서 직접 조회
- **postMessage**: Platform→Game(`INIT`, `PAUSE`, `RESUME`, `TERMINATE`), Game→Platform(`READY`, `SCORE`, `GAME_OVER`, `ERROR`)
- **iframe**: `sandbox="allow-scripts allow-same-origin"`
- **보안**: origin 검증, Zod 메시지 스키마, 환경변수 필수 (URL 하드코딩 금지)
- **상세**: `docs/game-integration.md`

## 어드민

- 라우트: `src/app/(admin)/admin/{name}/`
- 사이드바 레이아웃, 권한 검증 필수
- 게임 등록: S3 presigned URL → CloudFront 서빙

## 프로젝트 구조

```
src/
├── app/            # Next.js App Router
├── components/     # ui/ (shadcn) · common/ · layout/ · editor/ · filters/ · interaction/ · calendar/ · notification/ · providers/ · rating/
├── lib/            # 유틸리티 (cn() 등)
├── hooks/          # 커스텀 훅
├── i18n/           # 국제화 설정
├── mocks/          # MSW mock 데이터 (fixtures/ · handlers/)
├── types/          # 타입 정의
├── constants/      # 상수
├── assets/         # 정적 자산
├── styles/         # 글로벌 스타일
├── stories/        # Storybook
└── test/           # 테스트 설정
```

**Path Alias**: `@/*` → `src/*`, `@components/*`, `@lib/*`, `@hooks/*`, `@assets/*`, `@types/*`, `@constants/*`

**App Router 구조** (`src/app/`):

- `[locale]/` — i18n 동적 라우트, 모든 페이지의 루트
- `(auth)` · `(main)` · `(mypage)` · `(fullscreen)` · `(admin)` — Route Group (레이아웃 공유, URL 영향 없음)
- `_components/` · `_hooks/` · `_api/` · `_constants/` · `_schemas/` — 페이지 전용 private 폴더 (`_` prefix로 라우팅 제외)
- 여러 페이지에서 공유 시 상위 라우트 폴더의 `_components/` 등에 배치

**E2E 구조** (`e2e/`):

- `pages/` - Page Object Model (페이지별 로케이터 정의)
- `fixtures/` - 테스트 fixture (도메인별 분리, `index.ts`에서 `mergeTests`로 합성)
- `specs/` - 테스트 파일 (도메인별 폴더 분리)

**파일명**: kebab-case (`user-profile.tsx`, `use-auth-hook.ts`)

## 코드 작성 규칙

### 함수·Export

- **화살표 함수 기본** — `const` + 화살표 함수 사용. 단, Next.js 규약 파일(`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` 등)은 `export default function` 허용
- **named export 기본** — `export default` 금지. 단, Next.js 규약 파일 및 Storybook meta는 `export default` 허용

### 일반 규칙

| 규칙                | 설명                                        |
| ------------------- | ------------------------------------------- |
| `no-var`            | `var` 금지, `const`/`let` 사용              |
| `prefer-const`      | 재할당 없으면 `const`                       |
| `prefer-template`   | 문자열 연결 시 템플릿 리터럴                |
| `eqeqeq`            | `===`/`!==` 엄격 비교                       |
| `curly`             | if/else/for/while 중괄호 필수               |
| `no-nested-ternary` | 중첩 삼항 연산자 금지                       |
| `no-console`        | `console.log` 금지 (`warn`, `error`만 허용) |
| `no-debugger`       | `debugger` 금지                             |
| `no-alert`          | `alert` 금지                                |

### ESLint 주의

- **`padding-line-between-statements`**: 변수 선언·`return`·`if`·`for` 등 문 사이에 빈 줄 필수
- 코드 생성 후 `pnpm lint:fix` 실행 권장

## TypeScript 규칙

### 타입

- **`any` 금지** (ESLint error) — `unknown` + 타입 가드 사용
- **`never` 지양**
- **`interface` 우선** — `type`은 union일 경우만 사용
- **inline type import** — `import { type User } from '@/types'`
- 배열: 단순 타입 `T[]`, 복잡한 타입 `Array<T>`

### 기타 규칙

| 규칙                            | 설명                          |
| ------------------------------- | ----------------------------- |
| `prefer-nullish-coalescing`     | `\|\|` 대신 `??` 사용         |
| `prefer-optional-chain`         | `&&` 체이닝 대신 `?.` 사용    |
| `no-non-null-assertion`         | `!` (non-null assertion) 금지 |
| `prefer-as-const`               | 리터럴 타입은 `as const`      |
| `explicit-function-return-type` | 함수 반환 타입 명시 권장      |

### Promise 규칙

| 규칙                   | 설명                                    |
| ---------------------- | --------------------------------------- |
| `no-floating-promises` | Promise는 반드시 처리 (`await`/`catch`) |
| `await-thenable`       | thenable만 `await` 가능                 |
| `no-misused-promises`  | Promise 잘못 사용 방지                  |

## React 규칙

### React 19

- `forwardRef` → `ref` props 직접 사용
- `useContext` → `use` hook 사용
- `propTypes` → TypeScript 사용

### JSX 규칙

| 규칙                       | 설명                                           |
| -------------------------- | ---------------------------------------------- |
| `jsx-no-leaked-render`     | `&&` 렌더링 시 falsy 값 누출 방지 (`> 0` 체크) |
| `jsx-curly-brace-presence` | 불필요한 중괄호 제거                           |
| `self-closing-comp`        | 자식 없는 컴포넌트는 self-closing              |
| `hook-use-state`           | `useState` 네이밍 규칙 준수                    |

```tsx
// Good                                    // Bad
{items.length > 0 && <List />}             {items.length && <List />}
<Button disabled={isLoading} />            <Button disabled={isLoading}></Button>
<Input value="hello" />                    <Input value={'hello'} />
```

### Hooks

- `rules-of-hooks`: 최상위에서만 Hook 호출
- `exhaustive-deps`: 의존성 배열 규칙 준수

## 컴포넌트 규칙

### 아토믹 디자인

1. **공통 컴포넌트 우선** — `@/components/ui`에서 먼저 확인
2. **Storybook 필수** — 공통 컴포넌트 구현 시
3. **한 파일 하나 컴포넌트** — 예외: `components/ui/**`는 여러 개 허용 (shadcn 스타일)
4. **CVA + cn()** 으로 variants 관리

### CVA + cn() 패턴

```tsx
const componentVariants = cva('base-classes', {
  variants: {
    variant: { default: '...', destructive: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof componentVariants> {}

export const Component = ({ className, variant, size, ...props }: ComponentProps) => (
  <div className={cn(componentVariants({ variant, size }), className)} {...props} />
);
```

### Next.js

- `'use client'`와 `'use server'` 올바르게 사용
- 최대한 `'use server'`, 동적인 부분만 `'use client'`
- 쓸데없는 주석 작성 금지

## 컴포넌트 사용 규칙

컴포넌트를 수정하거나 새로 만들 때 **반드시** 확인:

1. **사용처 명시** — 다른 곳에서 사용 중이면 어디서 어떻게 사용되는지 먼저 말할 것
2. **사이드이펙트 예고** — 수정 시 영향이 있으면 코드 변경 **전에** 예상 결과를 말할 것
3. **공통 컴포넌트 체크** — `@/components` 하위에 사용 가능한 것이 있는지 확인
4. **@doubltworks 패키지 체크** — `@doubltworks/` 하위 공통 컴포넌트 사용 가능 여부 확인

## Import 규칙

### Import 순서 (Prettier 자동 정렬)

1. `react` → 2. 외부 라이브러리 → 3. `@/lib` → 4. `@/hooks` → 5. `@/assets` → 6. `@/types` → 7. `@/constants` → 8. `@/components` → 9. `@/app` → 10. 상대 경로

### Import 규칙

| 규칙                   | 설명                  |
| ---------------------- | --------------------- |
| `no-duplicates`        | 중복 import 금지      |
| `no-cycle`             | 순환 import 금지      |
| `no-self-import`       | 자기 자신 import 금지 |
| `newline-after-import` | import 후 빈 줄       |

## 스타일 규칙

### Prettier

| 옵션             | 값     |
| ---------------- | ------ |
| `printWidth`     | 100    |
| `tabWidth`       | 2      |
| `useTabs`        | false  |
| `semi`           | true   |
| `singleQuote`    | true   |
| `jsxSingleQuote` | false  |
| `trailingComma`  | all    |
| `bracketSpacing` | true   |
| `arrowParens`    | always |
| `endOfLine`      | lf     |

### Tailwind CSS

- `prettier-plugin-tailwindcss`로 클래스 자동 정렬
- `tailwind-merge`(`cn()`)로 클래스 충돌 방지

## Git 규칙

**Branch**: `{level}/{name}/{keyword}` (e.g., `f/jeh/cart`)

**Commit**: `[level] description` (e.g., `[feat] 공통 SNB 구현`)

**Co-Author 금지**: 커밋 메시지에 `Co-Authored-By` 줄을 추가하지 않는다.

| Level    | 약어 | 설명                       |
| -------- | ---- | -------------------------- |
| add      | a    | 패키지 추가                |
| config   | -    | config 파일 수정           |
| chore    | -    | 기능에 영향 없는 파일 수정 |
| docs     | d    | 문서 작성/수정             |
| feat     | f    | 새로운 기능 추가           |
| bugfix   | b    | 버그 수정                  |
| refactor | r    | 코드 리팩터링              |
| style    | s    | CSS 코드 수정              |

### Pre-commit Hooks

1. 브랜치 이름 검증 → 2. `.env` 방지 → 3. Knip → 4. TypeScript → 5. lint-staged (ESLint + Prettier)

> **Knip 주의**: 미사용 파일/export가 있으면 커밋 실패. 새 파일은 반드시 참조되어야 한다.

## 코멘트 규칙

형식: `// {LEVEL}: {description} {date} {name}`

| Level | 설명                    |
| ----- | ----------------------- |
| TODO  | 앞으로 추가해야 할 내용 |
| HACK  | 임시로 해결한 코드      |
| FIXME | 오작동이 알려진 코드    |
| XXX   | 당장 수정 필요한 코드   |

## 테스트

- **Vitest v4** + React Testing Library + happy-dom
- 설정: `vitest.config.ts`, 셋업: `src/test/setup.ts`
- 타입: `src/test/vitest.d.ts` (`vitest/globals` + `@testing-library/jest-dom/vitest`)
- `padding-line-between-statements`가 테스트에도 적용됨 — `render()`, `expect()` 사이 빈 줄 필수

## Auto Learning

Claude는 작업 중 발견한 프로젝트 지식을 `.claude/memory/`에 자동 기록한다.

```
.claude/memory/
├── _index.md       # 목차 + 핵심 요약 (항상 먼저 참조)
├── patterns.md     # 코드 패턴
├── pitfalls.md     # 실수와 해결법
├── decisions.md    # 기술적 결정
└── dependencies.md # 의존성 이슈
```

1. 새 항목 → 해당 카테고리 파일에 기록
2. 중요 사항 → `_index.md` 요약에도 추가
3. 파일 100줄 초과 → 하위 폴더로 분리

## 서브에이전트

특정 작업에 전문화된 서브에이전트를 사용할 수 있다. 명시적 요청 시에만 동작한다.

```
.claude/agents/
├── code-reviewer.md    # 코드 리뷰 (Sonnet)
├── test-runner.md      # 테스트 실행/분석 (Sonnet)
├── doc-writer.md       # 문서 작성 (Sonnet)
├── implementer.md      # 기능 구현 (inherit)
├── ui-designer.md      # AI 주도 UI 설계/구현 (inherit)
└── game-integrator.md  # iframe 게임 통합 (Sonnet)
```

> 상세: `docs/claude-agents.md`

## Slash Commands

```
.claude/commands/
├── git/    commit.md · push.md · pr.md
├── code/   component.md · story.md · feature.md · page.md · api.md · socket.md · hook.md · test.md · game.md · admin.md · design.md · schema.md
└── dev/    validate.md · review.md · refactor.md · brainstorm.md · seed.md
```

## 추천 워크플로우

### 기능 개발 흐름

```
1. /brainstorm <기능명>          → 설계 확정 (디자이너 없으므로 필수)
2. /code:schema (필요시)         → DB 모델 변경
3. /code:design <설명>           → AI 주도 UI 설계
4. /code:game 또는 /code:page    → 스캐폴딩
5. /code:component + /code:story → 컴포넌트 + Storybook
6. /code:api                     → API 라우트
7. /code:test                    → 테스트
8. /validate --fix               → 검증
9. /commit → /push → /pr         → 배포
```

### 디자이너 없는 환경 전략

1. `docs/design-system.md` 먼저 확정 (색상, 타이포, 간격)
2. **Storybook 우선 개발**: 공유 컴포넌트를 격리 환경에서 먼저 검증
3. **참고 사이트 활용**: itch.io, CrazyGames 등 유사 플랫폼 WebSearch로 참조
4. `/code:design` 커맨드로 설명 기반 UI 생성

## 참고 문서

- `docs/coding-conventions.md` — 전체 코딩 컨벤션 (코드 예시 포함)
- `docs/testing.md` — 테스트 작성 가이드 (Vitest + RTL 패턴)
- `docs/claude-agents.md` — 서브에이전트 및 브레인스토밍 가이드
- `docs/game-integration.md` — 게임 통합 프로토콜 (postMessage, iframe, 점수 제출)
- `docs/design-system.md` — 디자인 시스템 (컬러, 타이포, 컴포넌트 패턴)
- `docs/ui-patterns.md` — 페이지별 레이아웃 패턴 카탈로그
- `.claude/memory/` — Claude 자동 기록 지식 저장소
- `.claude/commands/` — 프로젝트 커스텀 슬래시 명령어
- `.claude/pr-rules.md` — PR 작성 규칙 (Why 중심, 템플릿 준수)
