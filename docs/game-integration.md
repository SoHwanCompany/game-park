# Game Integration Guide

게임 플랫폼과 iframe 게임 간의 통합 프로토콜 정의.

## 아키텍처

```
[게임 React 레포] → S3 업로드 → CloudFront CDN → iframe으로 플랫폼에 로드
```

- 게임은 별도 React 레포에서 개발
- 빌드 결과물을 S3에 업로드
- CloudFront CDN을 통해 서빙
- 플랫폼에서 iframe으로 로드하여 표시

## URL 패턴

게임 URL은 Game 테이블의 `url` 필드에 저장된다. DB에서 직접 조회하여 사용한다.

```
예시: https://{CLOUDFRONT_DOMAIN}/{gameCode}/index.html
```

```typescript
// Good — DB에서 조회한 URL 사용
const game = await prisma.game.findUnique({ where: { gameCode } });
const gameUrl = game.url;

// Bad — URL 하드코딩 금지
const gameUrl = 'https://d1234.cloudfront.net/tetris/index.html';
```

## iframe 설정

```tsx
<iframe
  src={gameUrl}
  sandbox="allow-scripts allow-same-origin"
  allow="autoplay; fullscreen"
  className="h-full w-full border-0"
  title={gameName}
/>
```

### sandbox 속성

| 속성                | 설명                 |
| ------------------- | -------------------- |
| `allow-scripts`     | JavaScript 실행 허용 |
| `allow-same-origin` | 동일 출처 정책 유지  |

`allow-forms`, `allow-popups`는 게임에서 필요한 경우에만 추가한다.

## postMessage 프로토콜

### Platform → Game

| 메시지      | 설명             | payload                        |
| ----------- | ---------------- | ------------------------------ |
| `INIT`      | 게임 초기화 요청 | `{ userId, nickname, gameId }` |
| `PAUSE`     | 게임 일시정지    | `{}`                           |
| `RESUME`    | 게임 재개        | `{}`                           |
| `TERMINATE` | 게임 종료        | `{}`                           |

```typescript
// Platform에서 Game으로 메시지 전송
iframe.contentWindow?.postMessage(
  { type: 'INIT', payload: { userId, nickname, gameId } },
  new URL(gameUrl).origin,
);
```

### Game → Platform

| 메시지      | 설명           | payload                               |
| ----------- | -------------- | ------------------------------------- |
| `READY`     | 게임 로드 완료 | `{}`                                  |
| `SCORE`     | 중간 점수 보고 | `{ score }`                           |
| `GAME_OVER` | 게임 종료      | `{ userId, gameId, score, playtime }` |
| `ERROR`     | 에러 발생      | `{ code, message }`                   |

```typescript
// Platform에서 Game 메시지 수신
window.addEventListener('message', (event) => {
  // origin 검증 필수
  if (event.origin !== new URL(gameUrl).origin) {
    return;
  }

  const { type, payload } = event.data;

  switch (type) {
    case 'READY':
      // 게임 초기화 메시지 전송
      break;
    case 'SCORE':
      // 점수 업데이트
      break;
    case 'GAME_OVER':
      // 게임 종료 처리, 랭킹 제출
      break;
    case 'ERROR':
      // 에러 표시
      break;
  }
});
```

## 메시지 스키마 (Zod)

```typescript
import { z } from 'zod';

const gameMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('READY'), payload: z.object({}) }),
  z.object({ type: z.literal('SCORE'), payload: z.object({ score: z.number() }) }),
  z.object({
    type: z.literal('GAME_OVER'),
    payload: z.object({
      userId: z.string(),
      gameId: z.string(),
      score: z.number(),
      playtime: z.number(),
    }),
  }),
  z.object({
    type: z.literal('ERROR'),
    payload: z.object({ code: z.string(), message: z.string() }),
  }),
]);
```

## 게임 생명주기

```
1. 페이지 로드 → iframe src 설정
2. Game: READY → Platform: INIT (userId, nickname, gameId)
3. 게임 플레이 중 → Game: SCORE (선택적)
4. 탭 비활성화 → Platform: PAUSE / 탭 활성화 → Platform: RESUME
5. 게임 종료 → Game: GAME_OVER (userId, gameId, score, playtime)
6. Platform: 랭킹 API 호출 → History 기록 → 결과 화면 표시
7. 페이지 이탈 → Platform: TERMINATE
```

## 점수 제출 플로우

```
Game: GAME_OVER { userId, gameId, score, playtime }
  → Platform: 정규화 (raw score → 0~10,000 통합 점수)
  → Platform: POST /api/games/{gameId}/ranking { score (정규화), playtime }
  → 결과 화면 (점수, 랭킹, 다시하기)
```

## 점수 체계 (Scoring System)

플랫폼은 모든 게임의 점수를 **0~10,000** 범위로 정규화하여 크로스게임 통합 랭킹을 제공한다.
게임은 기존 프로토콜 그대로 raw score만 전송하고, 정규화는 플랫폼이 담당한다.

### 게임 유형별 정규화 공식

게임은 두 유형으로 나뉘며, 각각 다른 정규화 공식을 사용한다:

#### 고정형 (Fixed) — 클리어 조건이 있는 게임

이론상 최고 점수가 정해져 있는 게임. 선형 정규화를 사용한다.

```
normalizedScore = (rawScore / maxRawScore) × 10,000
```

- `maxRawScore`: 게임의 이론상 최고 raw score (전 난이도 통틀어)
- 예시: Kaboom (지뢰찾기) — Hard 완벽 클리어 = 3,150점이 최고

#### 무한형 (Endless) — 실패할 때까지 계속하는 게임

점수 상한이 없는 게임. 쌍곡선 정규화를 사용한다.

```
normalizedScore = 10,000 × rawScore / (rawScore + halfScore)
```

- `halfScore`: 이 점수를 받으면 통합 5,000점이 되는 기준점
- 점수가 올라갈수록 수확 체감 (diminishing returns)
- 예시: Handle (한글 퍼즐) — 무한 라운드, 라운드별 점수 누적

### 게임 등록 시 점수 설정 (ScoringConfig)

새 게임을 등록할 때 유형에 맞는 파라미터 1개만 설정한다:

```typescript
interface GameScoringConfig {
  mode: 'fixed' | 'endless';

  // fixed: 이론상 최고 raw score (전 난이도 통틀어)
  maxRawScore?: number;

  // endless: 통합 5,000점에 해당하는 raw score
  halfScore?: number;
}
```

난이도 차등은 각 게임의 자체 점수 공식에 이미 반영되어 있으므로
플랫폼에서 별도로 난이도를 알 필요가 없다.

### 등록 예시

#### Kaboom (지뢰찾기) — 고정형

```typescript
const kaboomConfig: GameScoringConfig = {
  mode: 'fixed',
  maxRawScore: 3150, // Hard 완벽 클리어 시 최고점
};

// Easy 완벽 (500 raw)  → 500/3150 × 10,000 = 1,587점
// Medium 완벽 (1,400 raw) → 1400/3150 × 10,000 = 4,444점
// Hard 완벽 (3,150 raw)  → 3150/3150 × 10,000 = 10,000점
// Hard 50% 사망 (~150 raw) → 150/3150 × 10,000 = 476점
```

#### Handle (한글 퍼즐) — 무한형

```typescript
const handleConfig: GameScoringConfig = {
  mode: 'endless',
  halfScore: 3000, // 3,000 raw → 통합 5,000점
};

// Hard 1라운드 (12,000 raw)  → 10,000 × 12000/(12000+3000) = 8,000점
// Hard 3라운드 (36,000 raw)  → 10,000 × 36000/(36000+3000) = 9,231점
// Hard 10라운드 (120,000 raw) → 10,000 × 120000/(120000+3000) = 9,756점
// Easy 1라운드 (1,500 raw)   → 10,000 × 1500/(1500+3000) = 3,333점
// Easy 2라운드 (3,000 raw)   → 10,000 × 3000/(3000+3000) = 5,000점
```

### 새 게임 등록 가이드

1. **게임 유형 결정**: 클리어 조건이 있으면 `fixed`, 실패까지 계속하면 `endless`
2. **파라미터 설정**:
   - fixed → `maxRawScore`: 가장 어려운 난이도의 이론상 최고점
   - endless → `halfScore`: "중급 실력자가 받을 법한 점수" 기준으로 설정
3. **난이도 차등**: 게임 자체 점수 공식에서 처리 (플랫폼이 관여하지 않음)
4. **패배 시 부분 점수**: 게임 자체에서 처리 권장 (raw score > 0으로 전송)

## 에러 처리

| 에러 코드       | 설명                  | 대응                 |
| --------------- | --------------------- | -------------------- |
| `LOAD_FAILED`   | 게임 로드 실패        | 재시도 버튼 표시     |
| `INIT_FAILED`   | 초기화 실패           | 에러 메시지 + 재시도 |
| `RUNTIME_ERROR` | 런타임 에러           | 에러 메시지 + 나가기 |
| `TIMEOUT`       | READY 타임아웃 (10초) | 로딩 실패 메시지     |

## 보안 고려사항

1. **origin 검증**: 모든 postMessage 수신 시 `event.origin` 검증 필수
2. **메시지 스키마 검증**: Zod로 메시지 형식 검증
3. **iframe sandbox**: 최소 권한 원칙 적용
4. **URL 관리**: 게임 URL은 DB(Game.url)에서 조회, 하드코딩 금지
5. **점수 검증**: 서버 사이드에서 비정상 점수 필터링 (향후 구현)
