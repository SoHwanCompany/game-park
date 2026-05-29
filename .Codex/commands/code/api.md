# /code:api - API Route 핸들러 생성

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

Next.js App Router의 Route Handler를 생성합니다.

## 사용법

```
/code:api /api/products GET,POST
/code:api /api/products/[id] GET,PUT,DELETE
/code:api /api/cart --methods=GET,POST,DELETE
```

## 생성 파일

```
src/app/api/{path}/
└── route.ts
```

## route.ts 템플릿

```tsx
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>; // 동적 라우트 시
}

// GET /api/products
export const GET = async (request: NextRequest) => {
  try {
    // 구현
    return NextResponse.json({ data: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// POST /api/products
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    // 구현
    return NextResponse.json({ data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// GET /api/products/[id]
export const GET = async (request: NextRequest, { params }: RouteContext) => {
  try {
    const { id } = await params;
    // 구현
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
```

## 응답 패턴

```tsx
// 성공
NextResponse.json({ data: result });
NextResponse.json({ data: result }, { status: 201 });

// 에러
NextResponse.json({ error: 'Not Found' }, { status: 404 });
NextResponse.json({ error: 'Bad Request', details: errors }, { status: 400 });
NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

## 규칙

1. HTTP 메서드는 대문자로 export (GET, POST, PUT, DELETE, PATCH)
2. 에러 응답은 `{ error: string }` 형식
3. 성공 응답은 `{ data: T }` 형식
4. try-catch로 에러 핸들링 필수
5. 동적 라우트 params는 Promise로 받음 (Next.js 15+)
