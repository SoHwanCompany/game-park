# Game Park 아키텍처 현황 및 장기 운영 전략

> 작성일: 2026-04-06
> 목적: 현재 아키텍처 정리 + 장기적으로 쉽게 운영하기 위한 개선 방향 제안

---

## 1. 현재 아키텍처 전체 그림

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 (브라우저)                          │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐          ┌──────────────────────────┐
│   Vercel (Platform)  │          │   CloudFront CDN (Games)  │
│                     │          │                          │
│  Next.js 16         │  iframe  │  S3 → CloudFront         │
│  App Router         │◄────────►│  /kaboom/index.html      │
│  API Routes         │ postMsg  │  /handle/index.html      │
│  Auth.js (OAuth)    │          │  /tetris/index.html      │
└──────────┬──────────┘          └──────────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Neon PostgreSQL    │
│   (Serverless DB)    │
│   Prisma ORM         │
└─────────────────────┘
```

### 1.1 플랫폼 (Next.js on Vercel)

| 항목           | 현황                                                 |
| -------------- | ---------------------------------------------------- |
| **프레임워크** | Next.js 16 (App Router, Turbopack)                   |
| **호스팅**     | Vercel (GitHub Actions로 sync-to-vercel → 자동 배포) |
| **인증**       | Auth.js v5 (Google OAuth, Kakao OAuth, Credentials)  |
| **DB**         | Neon PostgreSQL (serverless) + Prisma ORM v7         |
| **API**        | Next.js API Routes (서버리스 함수)                   |
| **UI**         | Tailwind CSS 4 + shadcn/ui + Radix UI                |
| **상태관리**   | TanStack Query (서버 상태)                           |
| **CI/CD**      | GitHub Actions → type-check, lint, build             |

### 1.2 게임 (별도 React 앱 on S3/CloudFront)

| 항목       | 현황                                           |
| ---------- | ---------------------------------------------- |
| **개발**   | 별도 React 레포에서 개발 (보일러플레이트 기반) |
| **빌드**   | 정적 빌드 → `index.html` + assets              |
| **업로드** | S3 Presigned URL (어드민 패널)                 |
| **서빙**   | CloudFront CDN                                 |
| **통합**   | iframe + postMessage 프로토콜                  |
| **점수**   | GAME_OVER → API → 정규화 → 랭킹 저장           |

### 1.3 데이터베이스 스키마 요약

```
User ──┬── Account (OAuth)
       ├── Session
       ├── GameLike ──── Game ──── Category
       ├── Ranking ──────┘
       ├── Feedback ──── FeedbackComment
       │                 FeedbackStatusLog
       └── Report
```

- **User**: exp/level 시스템, 상태(ACTIVE/SUSPENDED/WITHDRAWN)
- **Game**: code(UK), gameUrl(CloudFront), status(DRAFT/PUBLISHED/SUSPENDED/ARCHIVED)
- **Ranking**: userId+gameId 복합 UK, score DESC 인덱스
- **Feedback**: 커뮤니티 의견 게시판 (상태 추적, 게임 연결)

### 1.4 게임-플랫폼 통신 프로토콜

```
Platform → Game: INIT, PAUSE, RESUME, TERMINATE
Game → Platform: READY, SCORE, GAME_OVER, ERROR
```

- 보안: origin 검증 + Zod 스키마 검증
- 점수: fixed 모드(maxRawScore) / endless 모드(halfScore) 정규화
- EXP: `scoreExp(0.01x) + playtimeExp(2/min)`, 레벨 = `exp/100 + 1`

---

## 2. 현재 운영 워크플로우 (게임 추가 과정)

```
1. 보일러플레이트 클론 → 게임 로직 작성
2. postMessage 프로토콜 구현 (READY, GAME_OVER 등)
3. 빌드 → 정적 파일 생성
4. S3 업로드 (어드민 패널 or 수동)
5. CloudFront 캐시 무효화
6. DB에 게임 등록 (code, title, gameUrl, scoring config)
7. scoring.ts에 점수 정규화 설정 추가
8. 플랫폼 코드 배포 (scoring config 변경 시)
```

### 2.1 현재 방식의 장점

- **심플함**: Vercel + Neon + S3/CloudFront 조합은 관리 포인트가 적음
- **서버리스**: 인프라 관리 부담 없음 (서버 패치, 스케일링 자동)
- **비용 효율**: 트래픽이 적을 때 거의 무료에 가까움
- **DX**: Next.js + Vercel 조합은 개발자 경험이 좋음
- **게임 격리**: 각 게임이 독립적으로 배포/롤백 가능

### 2.2 현재 방식의 문제점

| 문제                                 | 상세                                                           |
| ------------------------------------ | -------------------------------------------------------------- |
| **수동 작업 많음**                   | 게임 추가 시 S3 업로드 → DB 등록 → scoring.ts 수정 → 배포 필요 |
| **scoring config가 코드에 하드코딩** | 게임 추가마다 `scoring.ts` 수정 + 플랫폼 재배포 필요           |
| **게임 빌드 파이프라인 부재**        | 보일러플레이트 클론 → 수동 빌드 → 수동 업로드                  |
| **모니터링 부재**                    | 게임 오류, API 에러, 성능 지표 추적 안 됨                      |
| **환경 분리 부족**                   | staging/preview 환경 없이 프로덕션 직접 배포                   |
| **백업/복구 미비**                   | DB 백업 정책, 게임 빌드 버전 관리 없음                         |

---

## 3. 개선 방향 제안

### 방향 A: 현재 스택 최적화 (권장 — 단기~중기)

> EC2로 갈 필요 없다. 현재 Vercel + Neon + S3/CloudFront 조합이 Game Park 규모에 적합하다.
> **서버 관리 부담을 늘리지 말고, 자동화를 늘려라.**

#### A-1. 게임 등록 자동화 (가장 임팩트 큼)

**현재**: scoring.ts 하드코딩 → 플랫폼 재배포 필요

**개선**: scoring config를 DB로 이동

```prisma
model Game {
  // ... 기존 필드
  scoringMode   ScoringMode  // FIXED | ENDLESS
  maxRawScore   Int?         // fixed 모드용
  halfScore     Int?         // endless 모드용
}

enum ScoringMode {
  FIXED
  ENDLESS
}
```

**효과**:

- 게임 추가 시 플랫폼 코드 수정/재배포 불필요
- 어드민 패널에서 게임 등록 + 점수 설정까지 원스톱
- 향후 게임 개발자가 직접 등록할 수 있는 기반

#### A-2. 게임 배포 자동화 (CI/CD)

```
game-boilerplate/
├── .github/workflows/deploy.yml   ← 게임 빌드 + S3 업로드 자동화
├── scripts/deploy.sh              ← S3 sync + CloudFront 무효화
└── ...
```

**GitHub Actions 워크플로우**:

```yaml
# 게임 레포의 .github/workflows/deploy.yml
name: Deploy Game
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm build
      - uses: aws-actions/configure-aws-credentials@v4
      - run: aws s3 sync dist/ s3://$BUCKET/$GAME_CODE/
      - run: aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/$GAME_CODE/*"
```

**효과**:

- `git push`만 하면 게임 자동 배포
- 빌드 실패 시 배포 안 됨 (안전)
- 버전 관리 자동 (git history)

#### A-3. 게임 보일러플레이트 개선

현재 보일러플레이트에 추가할 것:

```
game-boilerplate/
├── src/
│   ├── lib/
│   │   └── platform.ts       ← postMessage 래퍼 (SDK)
│   │       - ready()
│   │       - sendScore(score)
│   │       - gameOver({ score, playtime })
│   │       - onInit(callback)
│   │       - onPause(callback)
│   │       - onResume(callback)
│   └── ...
├── game.config.json           ← 게임 메타데이터
│   {
│     "code": "my-game",
│     "title": "내 게임",
│     "scoringMode": "fixed",
│     "maxRawScore": 5000,
│     "category": "puzzle"
│   }
├── .github/workflows/deploy.yml
└── scripts/
    └── register.ts            ← 게임 등록 스크립트 (API 호출)
```

**Platform SDK** (`platform.ts`):

```typescript
// 게임 개발자가 쓰는 인터페이스
import { GameParkSDK } from '@game-park/sdk';

const sdk = new GameParkSDK();

sdk.onInit(({ userId, nickname }) => {
  // 게임 초기화
});

sdk.gameOver({ score: 1500, playtime: 120 });
```

**효과**:

- 게임 개발자가 postMessage 프로토콜 직접 구현할 필요 없음
- 타입 안전성 보장
- 프로토콜 변경 시 SDK만 업데이트

#### A-4. 어드민 패널 강화

현재 어드민 기능 + 추가할 것:

```
/admin
├── /games              ← 게임 목록 + CRUD
│   ├── 게임 등록 (URL + scoring config + 메타데이터)
│   ├── 게임 상태 변경 (DRAFT → PUBLISHED → ARCHIVED)
│   ├── 점수 설정 수정 (DB에서 관리)
│   └── 게임 통계 대시보드
├── /users              ← 사용자 관리
├── /feedback           ← 의견 관리 (현재 구현됨)
├── /reports            ← 신고 관리 (현재 구현됨)
└── /analytics          ← 간단한 통계 (NEW)
    ├── DAU/MAU
    ├── 게임별 플레이 수
    └── 인기 게임 트렌드
```

#### A-5. 모니터링 추가

**무료/저비용 옵션**:

| 도구                 | 용도                     | 비용                |
| -------------------- | ------------------------ | ------------------- |
| **Vercel Analytics** | 웹 성능, Core Web Vitals | 무료 (기본)         |
| **Sentry**           | 에러 추적 (프론트 + API) | 무료 (5K events/mo) |
| **Neon Dashboard**   | DB 쿼리 성능, 연결 수    | 내장                |
| **Uptime Robot**     | 다운타임 알림            | 무료 (50 monitors)  |

```bash
pnpm add @sentry/nextjs  # 에러 추적 추가
```

### 방향 B: 스케일업 (중기~장기, 사용자 증가 시)

> 사용자가 수천~만 명 이상 되면 고려할 것들

#### B-1. 데이터베이스 최적화

**현재**: Neon Free (0.5 GiB storage, 190시간 compute)

**다음 단계**:

- Neon Pro ($19/mo) — auto-scaling, 더 큰 저장소
- 또는 Supabase (PostgreSQL + 실시간 + 스토리지 통합)

**캐싱 레이어 추가**:

```
API Route → Redis (Upstash) → Neon PostgreSQL
```

- 랭킹 조회: Redis Sorted Set으로 캐싱
- 게임 목록: 30초 캐싱
- Upstash Redis: 서버리스, 무료 10K commands/day

```bash
pnpm add @upstash/redis
```

#### B-2. 실시간 기능 (선택)

멀티플레이어/실시간 랭킹 원할 때:

| 옵션                  | 장점                    | 비용                  |
| --------------------- | ----------------------- | --------------------- |
| **Supabase Realtime** | DB 변경 실시간 구독     | 무료 (2M messages/mo) |
| **Ably**              | 채널 기반 실시간        | 무료 (6M messages/mo) |
| **PartyKit**          | Cloudflare Workers 기반 | 무료 (100K 연결/mo)   |

→ EC2 + Socket.io 서버 올리는 것보다 이 방식이 관리가 훨씬 편함

#### B-3. CDN + 스토리지 통합

**현재**: 직접 관리하는 S3 + CloudFront

**대안 (더 편한 운영)**:

| 옵션                      | 장점                               |
| ------------------------- | ---------------------------------- |
| **Cloudflare R2 + Pages** | S3 호환 + 무료 이그레스 + CDN 자동 |
| **Vercel Blob**           | Vercel 통합, 별도 AWS 계정 불필요  |

→ R2가 가장 비용 효율적 (이그레스 비용 $0)

---

## 4. EC2는 왜 비추천인가

| 항목                | Vercel (현재)     | EC2                                    |
| ------------------- | ----------------- | -------------------------------------- |
| **서버 관리**       | 없음              | OS 패치, Node 업데이트, PM2/nginx 설정 |
| **스케일링**        | 자동              | 수동 (ALB + ASG 설정 필요)             |
| **배포**            | git push → 자동   | CI/CD 파이프라인 직접 구축             |
| **SSL**             | 자동              | Let's Encrypt + 갱신 관리              |
| **비용 (저트래픽)** | 무료~$20/mo       | 최소 $10~30/mo (t3.micro)              |
| **비용 (고트래픽)** | $20~100/mo        | 예측 어려움                            |
| **다운타임**        | Vercel 관리       | 직접 모니터링 필요                     |
| **CDN**             | Edge Network 내장 | CloudFront 별도 설정                   |
| **Preview 배포**    | PR당 자동         | 직접 구축                              |

**결론**: 소규모 팀이 게임 콘텐츠에 집중하려면 서버 관리에 시간 쓰면 안 된다.
EC2는 특수한 요구사항(WebSocket 서버, GPU 컴퓨팅, 커스텀 런타임 등)이 있을 때만 고려.

---

## 5. 단계별 로드맵

### Phase 1: 즉시 (1~2주)

- [ ] scoring config를 DB로 이동 (Game 모델에 scoringMode, maxRawScore, halfScore 추가)
- [ ] 어드민 게임 등록 시 scoring 설정도 함께 입력
- [ ] Sentry 연동 (에러 추적)

### Phase 2: 단기 (1개월)

- [ ] 게임 보일러플레이트에 Platform SDK 추가 (`@game-park/sdk`)
- [ ] 게임 레포 CI/CD 자동화 (GitHub Actions → S3 → CloudFront)
- [ ] 게임 등록 API 추가 (`POST /api/admin/games` — 메타데이터 + scoring 한번에)
- [ ] 어드민 대시보드에 기본 통계 추가

### Phase 3: 중기 (2~3개월)

- [ ] Upstash Redis 캐싱 (랭킹, 게임 목록)
- [ ] Cloudflare R2로 스토리지 마이그레이션 검토 (이그레스 비용 절감)
- [ ] 게임 개발자 포털 (셀프 서비스 게임 등록)
- [ ] Preview 환경 구축 (Vercel Preview + Neon Branch)

### Phase 4: 장기 (필요 시)

- [ ] 실시간 기능 (PartyKit 또는 Supabase Realtime)
- [ ] 멀티플레이어 인프라 (필요한 게임만)
- [ ] 국제화 CDN 최적화 (Multi-region)

---

## 6. 비용 추정

### 현재 (무료~저비용)

| 서비스          | 플랜          | 월 비용    |
| --------------- | ------------- | ---------- |
| Vercel          | Hobby         | $0         |
| Neon            | Free          | $0         |
| S3 + CloudFront | Free Tier     | ~$1        |
| GitHub Actions  | Free (2000분) | $0         |
| **합계**        |               | **~$1/mo** |

### Phase 2 이후 (트래픽 증가 시)

| 서비스        | 플랜          | 월 비용        |
| ------------- | ------------- | -------------- |
| Vercel        | Pro           | $20            |
| Neon          | Launch        | $19            |
| Upstash Redis | Pay-as-you-go | $0~5           |
| Sentry        | Free          | $0             |
| CloudFront    |               | ~$5            |
| **합계**      |               | **~$44~49/mo** |

### EC2 동등 구성 시 비용 참고

| 서비스            | 월 비용                   |
| ----------------- | ------------------------- |
| EC2 (t3.small)    | $15                       |
| RDS PostgreSQL    | $15~30                    |
| ALB               | $16                       |
| CloudFront        | ~$5                       |
| ElastiCache Redis | $13                       |
| Route 53          | $1                        |
| **합계**          | **$65~80/mo** + 관리 부담 |

---

## 7. 결론

1. **EC2로 가지 마라** — 현재 규모에서 서버 관리는 시간 낭비
2. **자동화에 투자하라** — 게임 추가 과정을 최대한 자동화 (scoring DB화, CI/CD, SDK)
3. **서버리스를 유지하라** — Vercel + Neon + S3/CloudFront 조합은 소규모 팀에 최적
4. **콘텐츠에 집중하라** — 인프라보다 좋은 게임을 더 빠르게 만드는 데 시간을 써라
5. **스케일 문제는 스케일이 생길 때 풀어라** — 조기 최적화 금지

> "게임파크의 경쟁력은 인프라가 아니라 게임 콘텐츠다.
> 인프라는 콘텐츠를 빠르게 올릴 수 있게 도와주는 파이프라인이어야 한다."
