# 어드민 대시보드 설계

> 작성일: 2026-05-28
> 작성자: dev4@doublt.com (Claude 협업)
> 상태: Draft — 구현은 별도 브랜치(`feat/kjh/admin-dashboard`)에서 진행
> 관련 로드맵: Sprint 5 — "어드민 대시보드 (유저/게임/피드백 관리 + 통계)"

---

## 1. 목적과 배경

Game Park 운영을 위한 통합 어드민 콘솔. 다음 운영 액션을 한 곳에서 처리한다.

- **모니터링**: 일/주/월별 트래픽, 게임별 플레이/좋아요 추이, 가입 추이
- **유저 관리**: 검색·필터, 정지/해제, 권한 변경, 강제 닉네임 변경, 가입 동의 이력 조회
- **게임 관리**: 등록·수정·상태 전환(DRAFT/PUBLISHED/SUSPENDED/ARCHIVED), 카테고리 관리
- **피드백 처리**: 의견 게시판(`Feedback`)의 상태 전이(PENDING→IN_REVIEW→RESOLVED/DEFERRED), 답변 작성
- **신고 처리**: `Report` 큐 처리(피드백/댓글 신고), 누적 신고 수 기반 자동 가림(soft hide) 정책
- **랭킹/운영**: 부정 점수 행 삭제, 게임별 리더보드 초기화 (이벤트성 운영)

## 2. 라우트 구조 및 접근 제어

### 2.1 라우트

CLAUDE.md 컨벤션을 그대로 따른다: `src/app/(admin)/admin/{name}/`

```
src/app/(admin)/
├── layout.tsx                       # 어드민 전용 레이아웃 (사이드바 + 헤더 + 권한 검증)
└── admin/
    ├── page.tsx                     # /admin → 대시보드 (KPI + 차트)
    ├── _components/                 # SideNav, AdminHeader, StatCard, TimeRangePicker 등
    ├── _api/                        # 어드민 전용 클라이언트 fetcher
    ├── _hooks/
    ├── users/
    │   ├── page.tsx                 # /admin/users (목록 + 필터)
    │   └── [id]/page.tsx            # /admin/users/[id] (상세 + 액션)
    ├── games/
    │   ├── page.tsx                 # /admin/games (목록)
    │   ├── new/page.tsx             # /admin/games/new (등록)
    │   └── [id]/
    │       ├── page.tsx             # /admin/games/[id] (수정/상태)
    │       └── stats/page.tsx       # /admin/games/[id]/stats (게임별 상세 통계)
    ├── categories/page.tsx          # /admin/categories
    ├── feedback/
    │   ├── page.tsx                 # /admin/feedback (큐)
    │   └── [id]/page.tsx            # /admin/feedback/[id] (상세 + 상태 전환 + 답글)
    ├── reports/
    │   ├── page.tsx                 # /admin/reports (큐)
    │   └── [id]/page.tsx            # /admin/reports/[id] (신고 사유/대상 미리보기)
    ├── rankings/
    │   └── [gameId]/page.tsx        # /admin/rankings/[gameId] (수동 제재/리셋)
    └── settings/page.tsx            # /admin/settings (운영 설정 — v2)
```

> 어드민 라우트는 그냥 `/admin/...` 평탄 구조로 둔다. (현 프로젝트에는 i18n 설정 자체가 없음 — CLAUDE.md의 `[locale]/` 언급은 미구현 상태)

### 2.2 접근 제어 (3중 방어)

| 레이어       | 위치                               | 검증                                                                                           |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| ① Middleware | `src/middleware.ts`                | `/admin/*` 요청 시 `session?.user?.role === 'ADMIN'` 아니면 `/login?from=/admin` 으로 redirect |
| ② Layout     | `src/app/(admin)/layout.tsx` (RSC) | `auth()`로 세션 재검증 + DB에서 role 재조회(stale JWT 방지) → 미달 시 `notFound()`             |
| ③ API        | `src/app/api/admin/**`             | 핸들러 진입부에서 `requireAdmin()` 가드 호출                                                   |

> JWT 콜백에 `role`을 함께 실어야 한다. `lib/auth.config.ts`의 `jwt`/`session` 콜백에 `token.role = user.role` / `session.user.role = token.role` 추가가 필수 선행 작업.

> 보안 추가: `Report` 처리/유저 정지 등 비가역 액션은 audit log를 남긴다(`FeedbackStatusLog` 패턴 차용 → `AdminAuditLog` 모델 신규).

### 2.3 API 라우트

```
src/app/api/admin/
├── stats/
│   ├── overview/route.ts            # GET: KPI 카드용 집계
│   ├── timeseries/route.ts          # GET ?metric=signup|play|like&from&to&bucket=day|week
│   └── games/route.ts               # GET: 게임별 play/like 순위
├── users/
│   ├── route.ts                     # GET: 목록 (q, status, role, sort), PATCH 일괄
│   └── [id]/route.ts                # GET/PATCH (status, role, nickname)
├── games/
│   ├── route.ts                     # GET/POST
│   └── [id]/route.ts                # GET/PATCH/DELETE
├── categories/route.ts
├── feedback/
│   ├── route.ts                     # GET: 큐 (status, category)
│   └── [id]/
│       ├── route.ts                 # GET/PATCH
│       └── status/route.ts          # POST: 상태 전이 + FeedbackStatusLog 기록
├── reports/
│   ├── route.ts                     # GET: 큐, aggregate by target
│   └── [id]/route.ts                # PATCH (resolve/dismiss)
└── rankings/
    └── [gameId]/
        ├── route.ts                 # GET
        └── [userId]/route.ts        # DELETE (부정 행 제거)
```

## 3. 화면별 기능 명세

### 3.1 `/admin` — 대시보드

상단 KPI 카드 행 + 시계열 차트 + Top 리스트.

**KPI 카드 (오늘 / 어제 비교)**

- 총 가입자 수, 신규 가입(오늘), DAU(`Session` 기준), 총 플레이 횟수(오늘), 총 신규 좋아요(오늘)
- 처리 대기: 피드백 PENDING 수, 미처리 신고 수 → 클릭 시 해당 큐로 이동

**시계열 차트 (기본 30일, 토글: 7d/30d/90d, bucket: day/week)**

- 가입자 추이
- 플레이 추이 (Game.playCount는 누적 카운터라 일별 추이는 별도 이벤트 테이블 필요 — §5 참고)
- 좋아요 추이 (`GameLike.createdAt` 기준)

**Top 리스트**

- 가장 많이 플레이된 게임 Top 10
- 좋아요 급상승 Top 10 (최근 7일 GameLike 카운트)
- 신고 누적 콘텐츠 Top 10

### 3.2 `/admin/users`

**목록**

- 컬럼: 닉네임 / 이메일 / role / status / exp / 가입일 / 최근 활동
- 필터: `q`(닉네임/이메일), `status`, `role`, 정렬(가입일/exp/최근활동)
- 페이지네이션: cursor 또는 offset (Prisma `take`/`skip`)

**상세 (`/admin/users/[id]`)**

- 프로필 + 동의 이력(약관/개인정보/마케팅/이메일인증)
- 활동 요약: 플레이한 게임 수, 좋아요 수, 작성한 피드백/댓글 수, 받은 신고 수
- 액션 (모두 audit log + 본인은 자기 자신 정지 불가):
  - 상태 변경 (ACTIVE ↔ SUSPENDED) — 사유 필수
  - 권한 변경 (USER ↔ ADMIN) — 비번 재확인 또는 슈퍼관리자만
  - 닉네임 강제 변경
  - 회원 탈퇴 처리 (soft: status=WITHDRAWN)

### 3.3 `/admin/games`

**목록**: 썸네일, 제목, 카테고리, 상태, playCount, likeCount, createdAt
**액션**: 상태 토글(DRAFT/PUBLISHED/SUSPENDED/ARCHIVED), 카테고리 변경, 일괄 SUSPEND

**등록/수정 (`/new`, `/[id]`)**

- 필드: code, title, description, categoryId, thumbnailUrl, gameUrl, status
- 썸네일/번들 업로드: S3 presigned URL → CloudFront 서빙 (`docs/game-integration.md` 흐름 차용)
- `gameUrl`은 CloudFront URL 검증 (origin allowlist)

**`/[id]/stats`**: 일자별 플레이/좋아요 추이, 평균 점수, 리더보드 Top 50

### 3.4 `/admin/categories`

- 목록 + 순서 변경(드래그) + isActive 토글 + 코드/이름/설명 편집
- 게임이 1개 이상 매핑된 카테고리는 삭제 차단

### 3.5 `/admin/feedback`

- 큐: 기본 정렬 `status=PENDING desc, createdAt asc`
- 필터: status, category, gameId, q(제목/내용)
- 상세에서 상태 전이 시 `FeedbackStatusLog`에 1행 추가, comment 필수 (이미 스키마 지원)
- 어드민 댓글은 `FeedbackComment`에 작성 (작성자 role 표기로 "운영자" 뱃지)

### 3.6 `/admin/reports`

- 큐: 대상(target)별 그룹핑 → "동일 대상에 N건 누적" 뷰
- 임계치 도달(예: 5건)된 대상은 상단 핀
- 처리 액션:
  - **유지(dismiss)**: Report row만 처리 상태로 표시
  - **숨김**: 대상이 `FEEDBACK`이면 `isPublic=false`, `COMMENT`면 soft delete(`deletedAt` 추가 필요 — §5)
  - **반복 신고 가해자 자동 정지**: 누적 N건 이상 신고당한 유저는 자동 SUSPENDED 후보 표시 (자동 X, 제안만)

### 3.7 `/admin/rankings/[gameId]`

- Top 100 + 검색(닉네임)
- 행 단위 삭제 (부정 점수 제거), audit log 기록
- "전체 리셋" 액션 — 더블 컨펌 + 사유 필수, 이벤트성 운영 (예: 주간 토너먼트 종료 후)

## 4. 사이드바 / 레이아웃

```
[Game Park Admin]
─ 대시보드
─ 콘텐츠
  ├─ 게임
  ├─ 카테고리
  └─ 랭킹
─ 운영
  ├─ 피드백 (배지: PENDING 수)
  └─ 신고 (배지: 미처리 수)
─ 유저
─ 설정
```

- shadcn `Sidebar` 컴포넌트 활용 (이미 `components/ui` 라인업)
- 헤더에 현재 관리자 닉네임 + 로그아웃
- 모바일은 우선순위 낮음 (어드민은 데스크톱 가정)

## 5. 스키마 보강 제안

기존 스키마로 80%는 가능하지만, 다음 4가지가 빠지면 기능이 절름발이가 된다.

### (필수) `AdminAuditLog`

```prisma
enum AdminAction {
  USER_STATUS_CHANGE
  USER_ROLE_CHANGE
  USER_NICKNAME_CHANGE
  GAME_STATUS_CHANGE
  GAME_DELETE
  FEEDBACK_STATUS_CHANGE
  REPORT_RESOLVE
  REPORT_HIDE_TARGET
  RANKING_ROW_DELETE
  RANKING_RESET
}

model AdminAuditLog {
  id        String      @id @default(cuid())
  actorId   String      @map("actor_id")
  action    AdminAction
  targetId  String?     @map("target_id")
  payload   Json?
  createdAt DateTime    @default(now()) @map("created_at")

  @@index([actorId, createdAt])
  @@index([action, createdAt])
  @@map("admin_audit_logs")
}
```

### (필수) `PlayEvent` (일별 추이 산출용)

`Game.playCount`는 누적값이라 "1주일 추이" 계산이 불가능. 가벼운 이벤트 로그가 필요.

```prisma
model PlayEvent {
  id        String   @id @default(cuid())
  gameId    String   @map("game_id")
  userId    String?  @map("user_id")    // 게스트 nullable
  playedAt  DateTime @default(now()) @map("played_at")

  @@index([gameId, playedAt])
  @@index([playedAt])
  @@map("play_events")
}
```

> 대안: Postgres `date_trunc` + 별도 마테리얼라이즈드 뷰. 초기에는 위 테이블이 단순하고 충분.

### (권장) `FeedbackComment.deletedAt` (soft delete)

신고로 인한 댓글 숨김 처리용. `deletedAt: DateTime?` 추가.

### (권장) `Report.status` + `resolvedBy`

```
enum ReportStatus { PENDING, DISMISSED, ACTIONED }
status     ReportStatus @default(PENDING)
resolvedBy String?      @map("resolved_by")
resolvedAt DateTime?    @map("resolved_at")
```

> 현재 `Report`는 처리 상태가 없어 "처리됨/미처리" 큐 구분이 불가.

## 6. 권한 가드 — 코드 패턴

```ts
// src/lib/api/admin-guard.ts
export const requireAdmin = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });

  if (user?.status !== 'ACTIVE' || user.role !== 'ADMIN') {
    throw new ApiError(403, 'FORBIDDEN');
  }

  return { userId: session.user.id };
};
```

모든 `/api/admin/**` 핸들러 진입부에서 호출.

## 7. UI/UX 원칙

- **데이터 그리드 일관성**: TanStack Table + shadcn `DataTable` 패턴 1개 만들어 모든 목록에 재사용
- **차트**: `recharts` (이미 React 친화, 번들 작음) — Area/Line/Bar 3종만 사용
- **컨펌 모달**: 비가역 액션은 항상 `AlertDialog` + 사유 textarea (audit log payload에 저장)
- **빈 상태**: 각 큐의 "처리할 항목 없음" 일러스트 1종 공통 사용
- **토스트**: 모든 mutation 성공/실패 토스트 (이미 sonner 사용 중일 가능성 → 확인 필요)

## 8. 구현 순서 (별도 브랜치 `feat/kjh/admin-dashboard`)

> 각 단계가 끝날 때마다 PR을 쪼개도 되고, 묶어서 1 PR로 가도 됨 (작업량에 따라 결정).

**Phase 0 — 기반**

1. `JWT/session 콜백에 role 추가` (`lib/auth.config.ts`)
2. `middleware.ts`에 `/admin/*` 가드 추가
3. `src/lib/api/admin-guard.ts` 작성
4. 스키마 보강 (§5 필수 항목) + migration + seed에 ADMIN 계정 1개

**Phase 1 — 레이아웃 & 대시보드** 5. `(admin)/layout.tsx` + 사이드바 6. `/admin` 대시보드 (KPI + Top 리스트만, 차트는 데이터 준비 후) 7. `/api/admin/stats/overview`

**Phase 2 — 콘텐츠 관리** 8. `/admin/games` 목록 + 상태 토글 9. `/admin/games/new`, `/admin/games/[id]` (S3 presigned 업로드는 별도 이슈로) 10. `/admin/categories`

**Phase 3 — 유저/운영 큐** 11. `/admin/users` 목록 + 상세 + 정지/권한 액션 12. `/admin/feedback` 큐 + 상태 전이 + 어드민 댓글 13. `/admin/reports` 큐 + 숨김/유지 액션

**Phase 4 — 분석 & 마감** 14. `PlayEvent` 적재 (`/api/games/[id]/play` 핸들러에 INSERT 추가) 15. 시계열 차트 + `/api/admin/stats/timeseries` 16. `/admin/games/[id]/stats` 17. `/admin/rankings/[gameId]` 18. 어드민 E2E 1세트 (로그인→유저 정지→피드백 처리→로그아웃) + 문서 업데이트

## 9. 비고 / 후속 과제

- **슈퍼관리자 분리**: 현재는 `ADMIN` 단일 등급. role 변경/리셋 같은 위험 액션은 v2에서 `SUPER_ADMIN` 분리 고려
- **2FA**: 어드민 계정은 v2에서 TOTP 강제 권장
- **Rate Limit**: 어드민 API는 일반 API와 별도 정책 — Sprint 5의 "API Rate Limiting" 작업과 합쳐 진행
- **i18n**: 현 프로젝트에 i18n 미적용. 도입 시 어드민은 제외 권장
- **로그 보관**: `AdminAuditLog`는 영구 보관, `PlayEvent`는 90일 후 일별 집계 테이블로 롤업 (v2)

---

## 10. 결정이 필요한 항목

구현 착수 전 한 번에 확정해야 할 것들:

1. `AdminAuditLog`, `PlayEvent` 추가 OK? (마이그레이션 1회 발생)
2. `Report.status` 추가 OK? (기존 Report 데이터 backfill 필요 → 전부 PENDING으로)
3. Phase 1~4를 1 PR로 갈지, Phase별로 쪼갤지
4. 차트 라이브러리 — `recharts`로 OK? 아니면 기존 사용 중인 게 있는지
