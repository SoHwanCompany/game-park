# 의견 게시판 기능 확장 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 의견 게시판에 게임 선택, 관리자 처리 상태, 신고 기능을 추가한다.

**Architecture:** Prisma 스키마에 FeedbackStatus/Report 모델을 추가하고, 기존 Feedback API를 확장하며, 신규 API 2개(status 변경, 신고)를 만든다. UI는 기존 컴포넌트를 확장하고 신고 모달을 새로 만든다.

**Tech Stack:** Next.js 16 (App Router), Prisma, TypeScript, Tailwind CSS, Radix UI Dialog, shadcn/ui

---

## Task 1: Prisma 스키마 확장

**Files:**

- Modify: `prisma/schema.prisma`

**Step 1: Enum 추가**

`schema.prisma`의 `FeedbackCategory` enum 아래에 3개 enum 추가:

```prisma
enum FeedbackStatus {
  PENDING
  CONFIRMED
  IN_REVIEW
  RESOLVED
  DEFERRED
}

enum ReportTargetType {
  FEEDBACK
  COMMENT
}

enum ReportReason {
  PROFANITY
  SPAM
  INAPPROPRIATE
  OTHER
}
```

**Step 2: Feedback 모델 확장**

`Feedback` 모델에 `gameId`와 `status` 필드 추가:

```prisma
model Feedback {
  id             String           @id @default(cuid())
  userId         String           @map("user_id")
  gameId         String?          @map("game_id")
  title          String           @db.VarChar(100)
  content        String
  category       FeedbackCategory @default(GENERAL)
  customCategory String?          @map("custom_category") @db.VarChar(50)
  status         FeedbackStatus   @default(PENDING)
  isPublic       Boolean          @default(true) @map("is_public")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  game       Game?             @relation(fields: [gameId], references: [id], onDelete: SetNull)
  comments   FeedbackComment[]
  statusLogs FeedbackStatusLog[]

  @@index([userId])
  @@index([gameId])
  @@index([isPublic, createdAt(sort: Desc)])
  @@map("feedbacks")
}
```

`Game` 모델에 역관계 추가:

```prisma
// Game 모델 내부, rankings 아래에 추가
feedbacks Feedback[]
```

**Step 3: FeedbackStatusLog 모델 추가**

```prisma
model FeedbackStatusLog {
  id         String         @id @default(cuid())
  feedbackId String         @map("feedback_id")
  status     FeedbackStatus
  comment    String?
  changedBy  String         @map("changed_by")
  createdAt  DateTime       @default(now()) @map("created_at")

  feedback Feedback @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [changedBy], references: [id], onDelete: Cascade)

  @@index([feedbackId, createdAt])
  @@map("feedback_status_logs")
}
```

`User` 모델에 역관계 추가:

```prisma
// User 모델 내부, feedbackComments 아래에 추가
feedbackStatusLogs FeedbackStatusLog[]
reports            Report[]
```

**Step 4: Report 모델 추가**

```prisma
model Report {
  id         String           @id @default(cuid())
  reporterId String           @map("reporter_id")
  targetType ReportTargetType @map("target_type")
  targetId   String           @map("target_id")
  reason     ReportReason
  detail     String?
  createdAt  DateTime         @default(now()) @map("created_at")

  reporter User @relation(fields: [reporterId], references: [id], onDelete: Cascade)

  @@unique([reporterId, targetType, targetId])
  @@index([targetType, targetId])
  @@map("reports")
}
```

**Step 5: 마이그레이션 실행**

Run: `pnpm prisma migrate dev --name add-feedback-status-game-report`

**Step 6: Prisma Client 재생성 확인**

Run: `pnpm prisma generate`

**Step 7: 커밋**

```bash
git add prisma/
git commit -m "[feat] 의견 게시판 확장 스키마 — 상태, 게임 연결, 신고"
```

---

## Task 2: 상수 및 타입 정의

**Files:**

- Modify: `src/constants/feedback.ts`
- Modify: `src/types/feedback.ts`
- Modify: `src/lib/api.ts`

**Step 1: 상수 추가**

`src/constants/feedback.ts`에 상태 및 신고 상수 추가:

```ts
export const FEEDBACK_STATUSES = [
  { value: 'PENDING', label: '접수 전' },
  { value: 'CONFIRMED', label: '확인했어요' },
  { value: 'IN_REVIEW', label: '살펴보는 중' },
  { value: 'RESOLVED', label: '반영했어요' },
  { value: 'DEFERRED', label: '다음에 참고할게요' },
] as const;

export const FEEDBACK_STATUS_MAP: Record<string, string> = {
  PENDING: '접수 전',
  CONFIRMED: '확인했어요',
  IN_REVIEW: '살펴보는 중',
  RESOLVED: '반영했어요',
  DEFERRED: '다음에 참고할게요',
} as const;

export const REPORT_REASONS = [
  { value: 'PROFANITY', label: '욕설 / 비방' },
  { value: 'SPAM', label: '스팸 / 광고' },
  { value: 'INAPPROPRIATE', label: '부적절한 내용' },
  { value: 'OTHER', label: '기타' },
] as const;
```

**Step 2: 타입 확장**

`src/types/feedback.ts` — FeedbackSummary와 FeedbackDetail에 status, game 필드 추가:

```ts
import { type FeedbackCategory, type FeedbackStatus } from '@prisma/client';

export interface FeedbackSummary {
  id: string;
  title: string;
  category: FeedbackCategory;
  customCategory: string | null;
  status: FeedbackStatus;
  isPublic: boolean;
  createdAt: string;
  user: {
    nickname: string;
  };
  game: {
    title: string;
  } | null;
  _count: {
    comments: number;
  };
}

export interface FeedbackDetail {
  id: string;
  title: string;
  content: string;
  category: FeedbackCategory;
  customCategory: string | null;
  status: FeedbackStatus;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
  };
  game: {
    id: string;
    title: string;
  } | null;
  comments: FeedbackCommentItem[];
  statusLogs: FeedbackStatusLogItem[];
}

export interface FeedbackCommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
  };
}

export interface FeedbackStatusLogItem {
  id: string;
  status: FeedbackStatus;
  comment: string | null;
  createdAt: string;
  user: {
    nickname: string;
  };
}
```

**Step 3: 에러 코드 추가**

`src/lib/api.ts`의 `ERROR_CODES`에 추가:

```ts
ALREADY_REPORTED: '이미 신고한 게시글입니다.',
REPORT_NOT_FOUND: '신고를 찾을 수 없습니다.',
```

**Step 4: 커밋**

```bash
git add src/constants/feedback.ts src/types/feedback.ts src/lib/api.ts
git commit -m "[feat] 의견 확장 상수 및 타입 정의"
```

---

## Task 3: API — 피드백 목록/상세 확장

**Files:**

- Modify: `src/app/api/feedback/route.ts`
- Modify: `src/app/api/feedback/[id]/route.ts`

**Step 1: GET /api/feedback 수정 (목록)**

`route.ts`의 GET 핸들러 — select에 `status`, `game` 추가, `gameId` 필터 지원:

```ts
export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const gameId = searchParams.get('gameId');
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

    const session = await auth();
    const currentUserId = session?.user?.id;

    const where = {
      ...(category && category !== 'all' ? { category: category as FeedbackCategory } : {}),
      ...(gameId ? { gameId } : {}),
      OR: [{ isPublic: true }, ...(currentUserId ? [{ userId: currentUserId }] : [])],
    };

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * FEEDBACK_PAGE_SIZE,
        take: FEEDBACK_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          category: true,
          customCategory: true,
          status: true,
          isPublic: true,
          createdAt: true,
          user: { select: { nickname: true } },
          game: { select: { title: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    const serialized = feedbacks.map((f) => ({
      ...f,
      createdAt: new Date(f.createdAt).toISOString(),
    }));

    return successResponse(
      { feedbacks: serialized, total, page, totalPages: Math.ceil(total / FEEDBACK_PAGE_SIZE) },
      '의견 목록을 조회했습니다.',
    );
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
```

POST 핸들러 — body에 `gameId` 추가:

```ts
// body 타입에 추가
gameId?: string;

// prisma.feedback.create data에 추가
gameId: gameId ?? null,
```

**Step 2: GET /api/feedback/[id] 수정 (상세)**

select에 `status`, `game`, `statusLogs` 추가:

```ts
const feedback = await prisma.feedback.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    content: true,
    category: true,
    customCategory: true,
    status: true,
    isPublic: true,
    createdAt: true,
    user: { select: { id: true, nickname: true } },
    game: { select: { id: true, title: true } },
    comments: {
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
      },
    },
    statusLogs: {
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        status: true,
        comment: true,
        createdAt: true,
        user: { select: { nickname: true } },
      },
    },
  },
});
```

직렬화에 statusLogs 추가:

```ts
const serialized = {
  ...feedback,
  createdAt: new Date(feedback.createdAt).toISOString(),
  comments: feedback.comments.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt).toISOString(),
  })),
  statusLogs: feedback.statusLogs.map((l) => ({
    ...l,
    createdAt: new Date(l.createdAt).toISOString(),
  })),
};
```

**Step 3: 커밋**

```bash
git add src/app/api/feedback/
git commit -m "[feat] 피드백 API에 상태, 게임, 상태이력 추가"
```

---

## Task 4: API — 관리자 상태 변경

**Files:**

- Create: `src/app/api/feedback/[id]/status/route.ts`

**Step 1: PATCH 핸들러 구현**

```ts
import { type FeedbackStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: FeedbackStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_REVIEW',
  'RESOLVED',
  'DEFERRED',
];

export const PATCH = async (request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 403);
    }

    const { id } = await context.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!feedback) {
      return errorResponse('FEEDBACK_NOT_FOUND', 404);
    }

    const body = (await request.json()) as {
      status?: FeedbackStatus;
      comment?: string;
    };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const [updatedFeedback] = await prisma.$transaction([
      prisma.feedback.update({
        where: { id },
        data: { status: body.status },
        select: { id: true, status: true },
      }),
      prisma.feedbackStatusLog.create({
        data: {
          feedbackId: id,
          status: body.status,
          comment: body.comment?.trim() ?? null,
          changedBy: session.user.id,
        },
      }),
    ]);

    return successResponse(updatedFeedback, '상태가 변경되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
```

**Step 2: 커밋**

```bash
git add src/app/api/feedback/[id]/status/
git commit -m "[feat] 관리자 의견 상태 변경 API"
```

---

## Task 5: API — 신고 기능

**Files:**

- Create: `src/app/api/report/route.ts`

**Step 1: POST 핸들러 구현**

```ts
import { type ReportReason, type ReportTargetType } from '@prisma/client';
import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_TARGET_TYPES: ReportTargetType[] = ['FEEDBACK', 'COMMENT'];
const VALID_REASONS: ReportReason[] = ['PROFANITY', 'SPAM', 'INAPPROPRIATE', 'OTHER'];

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { status: true },
    });

    if (user?.status === 'SUSPENDED') {
      return errorResponse('USER_SUSPENDED', 403);
    }

    const body = (await request.json()) as {
      targetType?: ReportTargetType;
      targetId?: string;
      reason?: ReportReason;
      detail?: string;
    };

    const { targetType, targetId, reason, detail } = body;

    if (!targetType || !targetId || !reason) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    if (!VALID_TARGET_TYPES.includes(targetType) || !VALID_REASONS.includes(reason)) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const existing = await prisma.report.findUnique({
      where: {
        reporterId_targetType_targetId: {
          reporterId: session.user.id,
          targetType,
          targetId,
        },
      },
    });

    if (existing) {
      return errorResponse('ALREADY_REPORTED', 409);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType,
        targetId,
        reason,
        detail: detail?.trim() ?? null,
      },
      select: { id: true },
    });

    return successResponse(report, '신고가 접수되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
```

**Step 2: 커밋**

```bash
git add src/app/api/report/
git commit -m "[feat] 게시글/댓글 신고 API"
```

---

## Task 6: UI — 게임 선택 Combobox

**Files:**

- Create: `src/app/(main)/feedback/_components/game-select.tsx`
- Modify: `src/app/(main)/feedback/_components/feedback-form.tsx`

**Step 1: 게임 선택 컴포넌트 생성**

`game-select.tsx` — 게임 목록을 불러와 검색 가능한 드롭다운으로 표시:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GameOption {
  id: string;
  title: string;
}

interface GameSelectProps {
  value: string | null;
  onChange: (gameId: string | null) => void;
}

export const GameSelect = ({ value, onChange }: GameSelectProps) => {
  const [games, setGames] = useState<GameOption[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGames = async (): Promise<void> => {
      try {
        const response = await fetch('/api/games?status=PUBLISHED&limit=100');
        const data = (await response.json()) as { data: { games: GameOption[] } };

        setGames(data.data.games);
      } catch {
        // 게임 목록 로드 실패 시 빈 배열 유지
      }
    };

    void fetchGames();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedGame = games.find((g) => g.id === value);

  const filtered = games.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
      <Label>관련 게임 (선택사항)</Label>

      <div ref={containerRef} className="relative">
        {selectedGame ? (
          <div className="border-input bg-background flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{selectedGame.title}</span>

            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-muted-foreground hover:text-foreground ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="게임 이름을 검색하세요"
          />
        )}

        {isOpen && !selectedGame && filtered.length > 0 ? (
          <ul className="bg-popover border-border absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
            {filtered.map((game) => (
              <li key={game.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(game.id);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className={cn(
                    'hover:bg-accent w-full px-3 py-2 text-left text-sm transition-colors',
                  )}
                >
                  {game.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {isOpen && !selectedGame && search && filtered.length === 0 ? (
          <div className="bg-popover border-border text-muted-foreground absolute z-50 mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-md">
            검색 결과가 없습니다
          </div>
        ) : null}
      </div>

      <p className="text-muted-foreground text-xs">
        특정 게임에 대한 의견이라면 게임을 선택해주세요.
      </p>
    </div>
  );
};
```

**Step 2: feedback-form.tsx 수정**

상단 import에 `GameSelect` 추가:

```tsx
import { GameSelect } from './game-select';
```

state 추가:

```tsx
const [gameId, setGameId] = useState<string | null>(null);
```

fetch body에 `gameId` 추가:

```tsx
body: JSON.stringify({
  title: title.trim(),
  content: content.trim(),
  category,
  customCategory: category === 'OTHER' ? customCategory.trim() : undefined,
  gameId,
  isPublic,
}),
```

JSX에서 카테고리 커스텀 입력과 `<Separator />` 사이에 게임 선택 삽입:

```tsx
{/* category === 'OTHER' 조건부 렌더링 다음 */}

<GameSelect value={gameId} onChange={setGameId} />

<Separator />
```

**Step 3: 게임 목록 API 확인 — 필요 시 간단한 게임 목록 API 추가**

기존 게임 API가 이 용도로 사용 가능한지 확인하고, 없으면 `GET /api/games` 라우트에서 `?status=PUBLISHED&limit=100` 지원이 되는지 확인. 안 되면 GameSelect 내부에서 직접 prisma를 쓰는 서버 컴포넌트 방식으로 전환하거나, 게임 목록을 props로 전달하는 방식으로 변경.

**Step 4: 커밋**

```bash
git add src/app/\(main\)/feedback/_components/game-select.tsx src/app/\(main\)/feedback/_components/feedback-form.tsx
git commit -m "[feat] 의견 작성 시 게임 선택 기능"
```

---

## Task 7: UI — 상태 Badge 표시

**Files:**

- Modify: `src/app/(main)/feedback/_components/feedback-item.tsx`
- Modify: `src/app/(main)/feedback/_components/feedback-detail-view.tsx`
- Modify: `src/app/(main)/feedback/page.tsx`
- Modify: `src/app/(main)/feedback/[id]/page.tsx`

**Step 1: 상태 Badge 색상 매핑**

`feedback-item.tsx`에 상태 색상 추가:

```tsx
import { FEEDBACK_STATUS_MAP } from '@/constants/feedback';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  IN_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  DEFERRED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
```

FeedbackItem JSX의 Badge 영역에 상태 Badge와 게임 Badge 추가:

```tsx
<Badge variant={badgeVariant}>{categoryLabel}</Badge>;

{
  feedback.status !== 'PENDING' ? (
    <span
      className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLE[feedback.status])}
    >
      {FEEDBACK_STATUS_MAP[feedback.status]}
    </span>
  ) : null;
}

{
  feedback.game ? (
    <Badge variant="outline" className="gap-1 text-xs">
      🎮 {feedback.game.title}
    </Badge>
  ) : null;
}
```

**Step 2: page.tsx 목록 쿼리 확장**

`src/app/(main)/feedback/page.tsx` — prisma select에 `status`와 `game` 추가:

```tsx
select: {
  id: true,
  title: true,
  category: true,
  customCategory: true,
  status: true,
  isPublic: true,
  createdAt: true,
  user: { select: { nickname: true } },
  game: { select: { title: true } },
  _count: { select: { comments: true } },
},
```

**Step 3: feedback-detail-view.tsx 상태 Badge 추가**

Badge 영역에 상태 표시 추가:

```tsx
import { FEEDBACK_STATUS_MAP } from '@/constants/feedback';

// STATUS_STYLE 동일하게 추가

// JSX Badge 영역
<Badge variant="secondary">{categoryLabel}</Badge>

<span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLE[feedback.status])}>
  {FEEDBACK_STATUS_MAP[feedback.status]}
</span>

{feedback.game ? (
  <Badge variant="outline" className="gap-1">
    🎮 {feedback.game.title}
  </Badge>
) : null}
```

**Step 4: [id]/page.tsx 상세 쿼리 확장**

prisma select에 `status`, `game`, `statusLogs` 추가 (Task 3의 API 변경과 동일):

```tsx
status: true,
game: { select: { id: true, title: true } },
statusLogs: {
  orderBy: { createdAt: 'asc' as const },
  select: {
    id: true,
    status: true,
    comment: true,
    createdAt: true,
    user: { select: { nickname: true } },
  },
},
```

직렬화에 statusLogs 추가.

**Step 5: 커밋**

```bash
git add src/app/\(main\)/feedback/
git commit -m "[feat] 의견 목록/상세에 상태 및 게임 Badge 표시"
```

---

## Task 8: UI — 상태 변경 이력 타임라인 + 관리자 상태 변경 UI

**Files:**

- Create: `src/app/(main)/feedback/_components/status-timeline.tsx`
- Create: `src/app/(main)/feedback/_components/admin-status-control.tsx`
- Modify: `src/app/(main)/feedback/_components/feedback-detail-view.tsx`
- Modify: `src/app/(main)/feedback/[id]/page.tsx`

**Step 1: 상태 변경 이력 타임라인 컴포넌트**

`status-timeline.tsx`:

```tsx
import { cn } from '@/lib/utils';
import { type FeedbackStatusLogItem } from '@/types/feedback';
import { FEEDBACK_STATUS_MAP } from '@/constants/feedback';

interface StatusTimelineProps {
  logs: FeedbackStatusLogItem[];
}

const STATUS_DOT: Record<string, string> = {
  PENDING: 'bg-muted-foreground',
  CONFIRMED: 'bg-blue-500',
  IN_REVIEW: 'bg-amber-500',
  RESOLVED: 'bg-green-500',
  DEFERRED: 'bg-gray-400',
};

export const StatusTimeline = ({ logs }: StatusTimelineProps) => {
  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">처리 현황</h3>

      <div className="space-y-3">
        {logs.map((log, index) => {
          const date = new Date(log.createdAt).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const isLast = index === logs.length - 1;

          return (
            <div key={log.id} className="relative flex gap-3 pl-4">
              <div className="absolute left-0 flex flex-col items-center">
                <div className={cn('mt-1.5 size-2.5 rounded-full', STATUS_DOT[log.status])} />

                {!isLast ? <div className="bg-border w-px flex-1" /> : null}
              </div>

              <div className="min-w-0 flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{FEEDBACK_STATUS_MAP[log.status]}</span>
                  <span className="text-muted-foreground text-xs">
                    {log.user.nickname} · {date}
                  </span>
                </div>

                {log.comment ? (
                  <p className="text-muted-foreground mt-1 text-sm">{log.comment}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

**Step 2: 관리자 상태 변경 컴포넌트**

`admin-status-control.tsx`:

```tsx
'use client';

import { useState } from 'react';

import { type FeedbackStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { FEEDBACK_STATUSES } from '@/constants/feedback';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface AdminStatusControlProps {
  feedbackId: string;
  currentStatus: FeedbackStatus;
}

export const AdminStatusControl = ({ feedbackId, currentStatus }: AdminStatusControlProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<FeedbackStatus>(currentStatus);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (status === currentStatus && !comment.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment: comment.trim() || undefined }),
      });

      if (response.ok) {
        setComment('');
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">상태 변경 (관리자)</h3>

      <div className="flex flex-wrap gap-2">
        {FEEDBACK_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value as FeedbackStatus)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              status === s.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-accent',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-comment" className="text-xs">
          코멘트 (선택)
        </Label>
        <Textarea
          id="admin-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="사용자에게 전달할 메시지를 입력하세요"
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || (status === currentStatus && !comment.trim())}
        >
          {isSubmitting ? '변경 중...' : '상태 변경'}
        </Button>
      </div>
    </div>
  );
};
```

**Step 3: feedback-detail-view.tsx에 타임라인 통합**

FeedbackDetailViewProps에 `isAdmin` 추가:

```tsx
interface FeedbackDetailViewProps {
  feedback: FeedbackDetail;
  currentUserId?: string;
  isAdmin?: boolean;
}
```

CardContent 내부, content 영역 아래에:

```tsx
{
  feedback.statusLogs.length > 0 ? (
    <>
      <Separator className="my-4" />
      <StatusTimeline logs={feedback.statusLogs} />
    </>
  ) : null;
}

{
  isAdmin ? (
    <>
      <Separator className="my-4" />
      <AdminStatusControl feedbackId={feedback.id} currentStatus={feedback.status} />
    </>
  ) : null;
}
```

**Step 4: [id]/page.tsx에서 isAdmin 전달**

현재 사용자의 role을 확인하여 FeedbackDetailView에 `isAdmin` prop 전달:

```tsx
const currentUserRole = currentUserId
  ? (
      await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      })
    )?.role
  : null;

const isAdmin = currentUserRole === 'ADMIN';

// JSX
<FeedbackDetailView feedback={serialized} currentUserId={currentUserId} isAdmin={isAdmin} />;
```

**Step 5: 커밋**

```bash
git add src/app/\(main\)/feedback/
git commit -m "[feat] 상태 변경 타임라인 및 관리자 상태 변경 UI"
```

---

## Task 9: UI — 신고 모달 + 신고 버튼

**Files:**

- Create: `src/app/(main)/feedback/_components/report-modal.tsx`
- Create: `src/app/(main)/feedback/_components/report-button.tsx`
- Modify: `src/app/(main)/feedback/_components/feedback-detail-view.tsx`
- Modify: `src/app/(main)/feedback/_components/comment-item.tsx`

**Step 1: 신고 모달 컴포넌트**

`report-modal.tsx` — Radix AlertDialog 기반, 사유 선택 + 자유 입력:

```tsx
'use client';

import { useState } from 'react';

import { type ReportReason, type ReportTargetType } from '@prisma/client';
import { AlertDialog } from 'radix-ui';

import { cn } from '@/lib/utils';
import { REPORT_REASONS } from '@/constants/feedback';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
}

export const ReportModal = ({ open, onOpenChange, targetType, targetId }: ReportModalProps) => {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'already' | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!reason) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          detail: detail.trim() || undefined,
        }),
      });

      if (response.ok) {
        setResult('success');
      } else if (response.status === 409) {
        setResult('already');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    onOpenChange(false);
    setReason(null);
    setDetail('');
    setResult(null);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/40',
            'data-[state=open]:animate-[modal-overlay-in_150ms_ease-out]',
            'data-[state=closed]:animate-[modal-overlay-out_150ms_ease-in]',
          )}
        />
        <AlertDialog.Content
          className={cn(
            'bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg',
            'data-[state=open]:animate-[modal-content-in_150ms_ease-out]',
            'data-[state=closed]:animate-[modal-content-out_150ms_ease-in]',
          )}
        >
          {result ? (
            <>
              <AlertDialog.Title className="text-lg font-semibold">
                {result === 'success' ? '신고 완료' : '이미 신고됨'}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
                {result === 'success'
                  ? '신고가 접수되었습니다. 검토 후 처리하겠습니다.'
                  : '이미 신고한 게시글입니다.'}
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end">
                <AlertDialog.Action asChild onClick={handleClose}>
                  <Button size="sm">확인</Button>
                </AlertDialog.Action>
              </div>
            </>
          ) : (
            <>
              <AlertDialog.Title className="text-lg font-semibold">신고하기</AlertDialog.Title>
              <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
                신고 사유를 선택해주세요.
              </AlertDialog.Description>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                        reason === r.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent',
                      )}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value as ReportReason)}
                        className="accent-primary"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-detail" className="text-xs">
                    추가 설명 (선택)
                  </Label>
                  <Textarea
                    id="report-detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="자세한 내용을 알려주시면 빠르게 처리할 수 있어요"
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <AlertDialog.Cancel asChild>
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    취소
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild onClick={handleSubmit}>
                  <Button size="sm" disabled={!reason || isSubmitting}>
                    {isSubmitting ? '접수 중...' : '신고하기'}
                  </Button>
                </AlertDialog.Action>
              </div>
            </>
          )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
```

**Step 2: 신고 버튼 컴포넌트**

`report-button.tsx`:

```tsx
'use client';

import { useState } from 'react';

import { type ReportTargetType } from '@prisma/client';

import { Button } from '@/components/ui/button';

import { ReportModal } from './report-modal';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  size?: 'default' | 'xs';
}

export const ReportButton = ({ targetType, targetId, size = 'xs' }: ReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="M3.5 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 1 0V9.5l1.566-.783A3.5 3.5 0 0 0 7.12 6.62l.18-.458a3.5 3.5 0 0 1 3.12-2.105l2.08-.18V2H3.5Z" />
        </svg>
      </Button>

      <ReportModal
        open={isOpen}
        onOpenChange={setIsOpen}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
};
```

**Step 3: feedback-detail-view.tsx에 신고 버튼 추가**

import 추가:

```tsx
import { ReportButton } from './report-button';
```

작성자 정보 영역 옆에 신고 버튼 (본인 글이 아닐 때만):

```tsx
{
  !isOwner && currentUserId ? <ReportButton targetType="FEEDBACK" targetId={feedback.id} /> : null;
}
```

**Step 4: comment-item.tsx에 신고 버튼 추가**

import 추가:

```tsx
import { ReportButton } from './report-button';
```

CommentItemProps에 없는 경우 — 삭제 버튼 옆에 신고 버튼 추가 (본인 댓글이 아닐 때):

```tsx
{
  isOwner ? (
    <Button /* 기존 삭제 버튼 */ />
  ) : currentUserId ? (
    <ReportButton targetType="COMMENT" targetId={comment.id} />
  ) : null;
}
```

**Step 5: 커밋**

```bash
git add src/app/\(main\)/feedback/_components/
git commit -m "[feat] 신고 모달 및 신고 버튼 구현"
```

---

## Task 10: 통합 검증 및 마무리

**Step 1: 타입 체크**

Run: `pnpm type-check`
Expected: 에러 없음

**Step 2: 린트 및 포맷팅**

Run: `pnpm lint:fix && pnpm format`
Expected: 에러 없음

**Step 3: Knip 검사**

Run: `pnpm knip`
Expected: 미사용 파일/export 없음

**Step 4: 전체 검증**

Run: `pnpm validate`
Expected: 모든 검사 통과

**Step 5: 빌드 검증**

Run: `pnpm build`
Expected: 빌드 성공

**Step 6: 최종 커밋 (수정 사항이 있을 경우)**

```bash
git add -A
git commit -m "[chore] 의견 게시판 확장 린트/타입 수정"
```
