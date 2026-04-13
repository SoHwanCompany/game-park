# /code:page - Next.js 페이지 스캐폴딩

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

App Router 기반 페이지 구조를 자동 생성합니다.

## 사용법

```
/code:page /products
/code:page /products/[id]
/code:page /checkout --no-layout
```

## 옵션

- `--no-layout`: layout.tsx 생성 안 함
- `--no-loading`: loading.tsx 생성 안 함
- `--no-error`: error.tsx 생성 안 함
- `--minimal`: page.tsx만 생성

## 생성 파일

```
src/app/{path}/
├── page.tsx      # 페이지 컴포넌트
├── layout.tsx    # 레이아웃 (선택)
├── loading.tsx   # 로딩 UI
└── error.tsx     # 에러 바운더리
```

## page.tsx 템플릿

```tsx
interface PageProps {
  params: Promise<{ id: string }>; // 동적 라우트 시
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  return (
    <main>
      <h1>Page Title</h1>
    </main>
  );
}
```

## loading.tsx 템플릿

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
    </div>
  );
}
```

## error.tsx 템플릿

```tsx
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2>문제가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

## 규칙

1. 파일명: kebab-case
2. 컴포넌트명: PascalCase
3. Next.js 규약 파일은 `export default function` 패턴 사용 (Next.js 권장)
4. error.tsx는 'use client' 필수
5. 동적 라우트 시 params 타입 자동 추론
6. https://nextjs.org/docs 넥스트 js docs전체 보고 공식 문서대로 구조 잡기
7. use client 와 use server을 제대로 사용하기.
8. 최대한 use server을 사용하고 동적인 것만 use client사용하기.
9. 다른 컴포넌트에서 사용하고 있을 경우 어떤 컴포넌트에서 어떻게 사용되고 있는지 말해줄 것.
10. 현재 코드 수정 시, 사이드이펙트가 생길 가능성이 있다면 어떤 사이드 이펙트가 어떻게 생길것 같은지 예상 결과를 말하고 코드 수정 전 미리 말할 것.
