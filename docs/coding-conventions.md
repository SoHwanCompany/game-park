## 목차

---

## 1. 코드 작성 규칙

### 함수 선언

- **화살표 함수**를 기본으로 사용한다
- `function` 키워드 대신 `const` + 화살표 함수 사용
- **예외**: Next.js 규약 파일(`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`)은 `export default function` 허용

```tsx
// Good
const handleClick = () => {
  // ...
};

export const MyComponent = () => {
  return <div />;
};

// Good — Next.js 규약 파일 (page.tsx, layout.tsx 등)
export default function Page() {
  return <main />;
}

// Bad
function handleClick() {
  // ...
}
```

### Export 규칙

- **named export**를 기본으로 사용한다
- `export default` 대신 named export 사용
- **예외**: Next.js 규약 파일(`page.tsx`, `layout.tsx` 등) 및 Storybook meta는 `export default` 허용

```tsx
// Good — 일반 컴포넌트
export const MyComponent = () => {
  return <div />;
};

// Good — Next.js 규약 파일
export default function Page() {
  return <main />;
}

// Bad — 일반 컴포넌트에서 default export
const MyComponent = () => {
  return <div />;
};
export default MyComponent;
```

### 일반 규칙

| 규칙                | 설명                                        |
| ------------------- | ------------------------------------------- |
| `no-var`            | `var` 사용 금지, `const`/`let` 사용         |
| `prefer-const`      | 재할당 없으면 `const` 사용                  |
| `prefer-template`   | 문자열 연결 시 템플릿 리터럴 사용           |
| `eqeqeq`            | `===`, `!==` 사용 (엄격 비교)               |
| `curly`             | if/else/for/while 등 중괄호 필수            |
| `no-nested-ternary` | 중첩 삼항 연산자 금지                       |
| `no-console`        | `console.log` 금지 (`warn`, `error`만 허용) |
| `no-debugger`       | `debugger` 사용 금지                        |
| `no-alert`          | `alert` 사용 금지                           |

---

## 2. TypeScript 규칙

### 타입 사용

- **`any` 타입 사용 금지** (ESLint error)
- **`never` 타입 사용 지양**
- `unknown` 사용 시 **타입 가드 필수**

```tsx
// Good
const parseData = (data: unknown): string => {
  if (typeof data === 'string') {
    return data;
  }
  throw new Error('Invalid data type');
};

// Bad
const parseData = (data: any): string => {
  return data;
};
```

### 타입 import

- **type import** 사용 (`inline-type-imports` 스타일)

```tsx
// Good
// Bad
import { Product, User, type Product, type User } from '@/types';
```

### 타입 정의

- **interface** 사용 (type 대신, union일 경우 예외)

```tsx
// Good
interface User {
  id: string;
  name: string;
}

// Bad
type User = {
  id: string;
  name: string;
};
```

### 배열 타입

- 단순 타입: `T[]` 사용
- 복잡한 타입: `Array<T>` 사용

```tsx
// Good
const numbers: number[] = [1, 2, 3];
const items: Array<{ id: string; name: string }> = [];

// Bad
const numbers: Array<number> = [1, 2, 3];
```

### 기타 규칙

| 규칙                            | 설명                               |
| ------------------------------- | ---------------------------------- |
| `prefer-nullish-coalescing`     | `\|\|` 대신 `??` 사용              |
| `prefer-optional-chain`         | `&&` 체이닝 대신 `?.` 사용         |
| `no-non-null-assertion`         | `!` (non-null assertion) 사용 금지 |
| `prefer-as-const`               | 리터럴 타입은 `as const` 사용      |
| `explicit-function-return-type` | 함수 반환 타입 명시 권장           |

### Promise 규칙

| 규칙                   | 설명                                |
| ---------------------- | ----------------------------------- |
| `no-floating-promises` | Promise는 반드시 처리 (await/catch) |
| `await-thenable`       | thenable만 await 가능               |
| `no-misused-promises`  | Promise 잘못 사용 방지              |

---

## 3. React 규칙

### React 19 규칙

- **React 19에서 deprecated된 API 사용 금지**
  - `forwardRef` → `ref` props 직접 사용
  - `useContext` → `use` hook 사용
  - `propTypes` → TypeScript 사용

### JSX 규칙

| 규칙                       | 설명                              |
| -------------------------- | --------------------------------- |
| `jsx-no-leaked-render`     | `&&` 렌더링 시 falsy 값 누출 방지 |
| `jsx-curly-brace-presence` | 불필요한 중괄호 제거              |
| `self-closing-comp`        | 자식 없는 컴포넌트는 self-closing |
| `hook-use-state`           | useState 네이밍 규칙 준수         |

```tsx
// Good
<Button disabled={isLoading} />
<Input value="hello" />
{items.length > 0 && <List items={items} />}

// Bad
<Button disabled={isLoading}></Button>
<Input value={'hello'} />
{items.length && <List items={items} />}

```

### Hooks 규칙

- `rules-of-hooks`: 최상위에서만 Hook 호출
- `exhaustive-deps`: 의존성 배열 규칙 준수

---

## 4. 컴포넌트 규칙

### 아토믹 디자인 패턴

1. **공통 컴포넌트 우선 사용**: 재사용 가능한 컴포넌트가 있으면 **공통 컴포넌트부터 사용**
2. **UI 컴포넌트 경로**: `@/components/ui` 에서 먼저 확인
3. **Storybook 필수**: 공통 컴포넌트 구현 시 **반드시 Storybook 작성**

### 컴포넌트 파일 규칙

- **한 파일에 하나의 컴포넌트만 정의**
- 예외: `components/ui/**` 하위 파일은 여러 컴포넌트 허용 (shadcn 스타일)

```
// Good - 파일당 하나의 컴포넌트
src/components/button/primary-button.tsx  → PrimaryButton
src/components/button/secondary-button.tsx → SecondaryButton

// 예외 - ui 컴포넌트는 여러 개 허용
src/components/ui/dialog.tsx → Dialog, DialogTrigger, DialogContent, ...

```

### CVA (Class Variance Authority)

- shadcn 컴포넌트 스타일을 **cva로 분리**하여 직관적으로 관리

```tsx
// Good
const buttonVariants = cva('inline-flex items-center justify-center', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export const Button = ({ variant, size, className, ...props }) => {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
};
```

---

## 5. 파일/폴더 규칙

### 파일명

- **케밥 케이스(kebab-case)** 사용

```
// Good
user-profile.tsx
use-auth-hook.ts
api-service.ts

// Bad
UserProfile.tsx
useAuthHook.ts
apiService.ts

```

### 폴더 구조

```
src/
├── app/                 # Next.js App Router
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── ui/              # shadcn 기반 공통 컴포넌트
│   ├── common/          # 공통 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   ├── editor/          # 에디터 컴포넌트
│   ├── filters/         # 필터 컴포넌트
│   ├── interaction/     # 인터랙션 컴포넌트
│   ├── calendar/        # 캘린더 컴포넌트
│   ├── notification/    # 알림 컴포넌트
│   ├── providers/       # Provider 컴포넌트
│   └── rating/          # 평점 컴포넌트
├── lib/                 # 유틸리티 및 설정
├── hooks/               # 커스텀 React 훅
├── i18n/                # 국제화 설정
├── mocks/               # MSW mock 데이터 (fixtures/ · handlers/)
├── types/               # TypeScript 타입 정의
├── constants/           # 상수
├── assets/              # 정적 자산
├── styles/              # 글로벌 스타일
├── stories/             # Storybook 스토리
└── test/                # 테스트 설정

```

### App Router 디렉토리 구조

```
src/app/
├── layout.tsx                   # 루트 레이아웃
├── globals.css                  # 글로벌 스타일
├── fonts/                       # 폰트 파일
├── (fullscreen)/                # 풀스크린 레이아웃 그룹
│   └── notifications/
└── [locale]/                    # i18n 동적 라우트
    ├── layout.tsx
    ├── (auth)/                  # 인증 레이아웃 그룹
    │   ├── login/
    │   ├── signup/
    │   ├── forgot-username/
    │   └── forgot-password/
    ├── (main)/                  # 메인 레이아웃 그룹
    │   ├── talk/
    │   ├── matching/
    │   ├── oem/
    │   ├── global/
    │   └── support/
    └── (mypage)/                # 마이페이지 레이아웃 그룹
        ├── profile/
        ├── orders/
        ├── cart/
        └── ...
```

#### Route Group 규칙

- **`(group)`** — 레이아웃 공유를 위한 Route Group. URL에 영향 없음
  - `(auth)` — 인증 관련 페이지 (로그인, 회원가입 등)
  - `(main)` — 메인 레이아웃 (GNB/SNB 포함)
  - `(mypage)` — 마이페이지 레이아웃
  - `(fullscreen)` — 풀스크린 레이아웃
  - `(list)` — 목록 페이지 전용 레이아웃 (예: `talk/(list)/qna`)

#### 페이지 내부 private 폴더 (`_prefix`)

페이지 전용 모듈은 **`_` prefix**로 라우팅에서 제외하고 해당 페이지 폴더 안에 co-locate 한다.

```
app/[locale]/(auth)/login/
├── page.tsx
├── _components/         # 페이지 전용 컴포넌트
│   └── login-form.tsx
├── _hooks/              # 페이지 전용 훅
│   └── use-login-schema.ts
└── _schemas/            # 페이지 전용 스키마 (Zod 등)
    └── login-schema.ts
```

| Private 폴더   | 용도                                     |
| -------------- | ---------------------------------------- |
| `_components/` | 해당 페이지에서만 사용하는 컴포넌트      |
| `_hooks/`      | 해당 페이지에서만 사용하는 커스텀 훅     |
| `_api/`        | 해당 페이지에서만 사용하는 API 호출 로직 |
| `_constants/`  | 해당 페이지에서만 사용하는 상수          |
| `_schemas/`    | 해당 페이지에서만 사용하는 Zod 스키마    |

- 여러 페이지에서 공유하는 경우 상위 라우트 폴더의 `_components/` 등에 배치
- 예: `talk/_components/`는 talk 하위 모든 페이지에서 공유

### Path Alias

| Alias           | 경로                 |
| --------------- | -------------------- |
| `@/*`           | `./src/*`            |
| `@components/*` | `./src/components/*` |
| `@lib/*`        | `./src/lib/*`        |
| `@hooks/*`      | `./src/hooks/*`      |
| `@assets/*`     | `./src/assets/*`     |
| `@types/*`      | `./src/types/*`      |
| `@constants/*`  | `./src/constants/*`  |

---

## 6. Import 규칙

### Import 순서 (자동 정렬)

Prettier 플러그인에 의해 자동 정렬됨:

1. `react` 관련
2. 외부 라이브러리 (`<THIRD_PARTY_MODULES>`)
3. `@/lib/*`
4. `@/hooks/*`
5. `@/assets/*`
6. `@/types/*`
7. `@/constants/*`
8. `@/components/*`
9. `@/app/*`
10. 상대 경로 (`./`, `../`)

### Import 규칙

| 규칙                   | 설명                  |
| ---------------------- | --------------------- |
| `no-duplicates`        | 중복 import 금지      |
| `no-cycle`             | 순환 import 금지      |
| `no-self-import`       | 자기 자신 import 금지 |
| `newline-after-import` | import 후 빈 줄 추가  |

---

## 7. 스타일 규칙

### Prettier 설정

| 옵션             | 값     | 설명                  |
| ---------------- | ------ | --------------------- |
| `printWidth`     | 100    | 한 줄 최대 길이       |
| `tabWidth`       | 2      | 탭 너비               |
| `useTabs`        | false  | 스페이스 사용         |
| `semi`           | true   | 세미콜론 필수         |
| `singleQuote`    | true   | 작은따옴표 사용       |
| `jsxSingleQuote` | false  | JSX는 큰따옴표        |
| `trailingComma`  | all    | 후행 쉼표 필수        |
| `bracketSpacing` | true   | 객체 중괄호 간격      |
| `arrowParens`    | always | 화살표 함수 괄호 필수 |
| `endOfLine`      | lf     | 줄바꿈 문자           |

### Tailwind CSS

- `prettier-plugin-tailwindcss`로 클래스 자동 정렬
- `tailwind-merge` 사용으로 클래스 충돌 방지

---

## 8. Git 규칙

### 브랜치 네이밍

```
{level}/{name}/{keyword}

```

**예시:**

- `f/jeh/cart` - 장바구니 기능
- `feat/john/login-page` - 로그인 페이지
- `b/jeh/fix-header` - 헤더 버그 수정

**Level 종류:**

| Level    | 약어 | 설명                              |
| -------- | ---- | --------------------------------- |
| add      | a    | 패키지 추가                       |
| config   | -    | config 파일 수정                  |
| chore    | -    | 기능에 영향을 주지 않는 파일 수정 |
| docs     | d    | 문서 작성/수정                    |
| feat     | f    | 새로운 기능 추가                  |
| bugfix   | b    | 버그 수정                         |
| refactor | r    | 코드 리팩터링                     |
| style    | s    | CSS 코드 수정                     |

### 커밋 메시지

```
[level] description

```

**예시:**

- `[feat] 공통 SNB 구현`
- `[bugfix] 헤더 스크롤 버그 수정`
- `[config] ESLint 규칙 추가`

### Git Hooks (pre-commit)

1. 브랜치 이름 검증
2. `.env` 파일 커밋 방지
3. Knip (미사용 코드 검사)
4. TypeScript 타입 검사
5. lint-staged (ESLint + Prettier)

---

## 9. 코멘트 규칙

### 형식

```tsx
// {level}: {description} {date} {name}
```

### 예시

```tsx
// TODO: 장바구니 조회 API 연동 2024.01.28 jeh
// FIXME: 주문 생성 API가 2번 호출되는 문제 2024.01.28 jeh
// HACK: 임시로 setTimeout으로 해결 2024.01.28 jeh
// XXX: 당장 수정 필요 - 메모리 누수 발생 2024.01.28 jeh
```

### Level 종류

| Level | 설명                                        |
| ----- | ------------------------------------------- |
| TODO  | 아직 해결하지 않은, 앞으로 추가해야 할 내용 |
| HACK  | 임시로 문제를 해결한 코드                   |
| FIXME | 오작동을 일으킨다고 알려진 코드             |
| XXX   | 당장 수정이 필요한 코드                     |

---

## 10. 스크립트

| 스크립트          | 설명                                 |
| ----------------- | ------------------------------------ |
| `pnpm dev`        | 개발 서버 실행 (Turbopack)           |
| `pnpm build`      | 프로덕션 빌드                        |
| `pnpm lint`       | ESLint 검사                          |
| `pnpm lint:fix`   | ESLint 자동 수정                     |
| `pnpm format`     | Prettier 포맷팅                      |
| `pnpm type-check` | TypeScript 타입 검사                 |
| `pnpm knip`       | 미사용 코드 검사                     |
| `pnpm validate`   | 전체 검사 (type-check + lint + knip) |
| `pnpm storybook`  | Storybook 실행 (port 6006)           |

---

## 11. 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Library**: Radix UI + shadcn/ui
- **Form**: React Hook Form + Zod
- **Testing**: Storybook 10
- **Linting**: ESLint 9 (엄격 모드)
- **Formatting**: Prettier 3
- **Git Hooks**: Husky 9
- **Unused Code**: Knip 5
