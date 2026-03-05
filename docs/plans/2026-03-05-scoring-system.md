# 게임 플랫폼 경험치 정규화 설계

## 개요

게임 점수는 raw score 그대로 저장하고(랭킹은 게임별 독립), 플랫폼 경험치 계산 시에만 0~10,000으로 정규화하여 게임 간 공정한 EXP 보상을 제공하는 체계.

## 배경

- 게임마다 점수 범위가 다름 (Kaboom 0~3,150 vs Handle 무한 누적)
- 랭킹은 게임별 독립이므로 점수 정규화 불필요
- 그러나 플랫폼 경험치는 게임 간 공정해야 함 → 정규화 필요
- 점수 설계는 게임 개발자에게 전적으로 위임

## 설계

### 핵심 원칙

1. **점수는 게임 자율** — 게임이 보낸 raw score를 그대로 랭킹에 저장
2. **EXP만 정규화** — 경험치 계산 시에만 raw score를 0~10,000으로 정규화
3. **프로토콜 불변** — GAME_OVER는 기존대로 `{ userId, gameId, score, playtime }`만 전송
4. **파라미터 1개** — 새 게임 등록 시 설정할 값은 1개뿐

### 아키텍처

```
┌─────────────┐     GAME_OVER      ┌──────────────────┐                ┌──────────────┐
│  Game       │ ──────────────────→ │  Platform API    │ ─── raw ────→ │  Ranking     │
│  (iframe)   │  { score,          │                  │   score 저장   │  (DB)        │
│             │    playtime }      │  normalizeScore  │                └──────────────┘
│             │                    │  → calculateExp  │                ┌──────────────┐
│             │  프로토콜 변경 없음  │                  │ ─── EXP ────→ │  User.exp    │
└─────────────┘                    └──────────────────┘   경험치 반영   │  (DB)        │
                                                                       └──────────────┘
```

### 게임 유형별 정규화 공식

#### 고정형 (Fixed) — 클리어 조건이 있는 게임

이론상 최고 점수가 정해져 있는 게임. 선형 정규화를 사용한다.

```
normalizedScore = (rawScore / maxRawScore) x 10,000
```

- `maxRawScore`: 게임의 이론상 최고 raw score (전 난이도 통틀어)
- 난이도 차등은 게임 자체 점수 공식에 이미 반영됨

#### 무한형 (Endless) — 실패할 때까지 계속하는 게임

점수 상한이 없는 게임. 쌍곡선 정규화를 사용한다.

```
normalizedScore = 10,000 x rawScore / (rawScore + halfScore)
```

- `halfScore`: 이 점수를 받으면 통합 5,000점이 되는 기준점
- 점수가 올라갈수록 수확 체감 (diminishing returns)
- 10,000에 절대 도달하지 않음 (항상 개선 여지가 있음)

### 게임 등록 설정 (ScoringConfig)

```typescript
interface GameScoringConfig {
  mode: 'fixed' | 'endless';

  // fixed: 이론상 최고 raw score (전 난이도 통틀어)
  maxRawScore?: number;

  // endless: 통합 5,000점에 해당하는 raw score
  halfScore?: number;
}
```

### 적용: Kaboom (지뢰찾기) — 고정형

```typescript
const kaboomConfig: GameScoringConfig = {
  mode: 'fixed',
  maxRawScore: 3150, // Hard 완벽 클리어 시 최고점
};
```

| 시나리오              | Raw   | 정규화 계산        | 통합 점수  |
| --------------------- | ----- | ------------------ | ---------- |
| Easy 완벽 클리어      | 500   | 500/3150 x 10,000  | **1,587**  |
| Medium 빠른 클리어    | 1,200 | 1200/3150 x 10,000 | **3,810**  |
| Medium 완벽 클리어    | 1,400 | 1400/3150 x 10,000 | **4,444**  |
| Hard 완벽 클리어      | 3,150 | 3150/3150 x 10,000 | **10,000** |
| Hard 50% 진행 후 사망 | ~150  | 150/3150 x 10,000  | **476**    |

난이도 차등은 Kaboom 자체 배수(Easy 1x / Medium 2x / Hard 3x)로 이미 반영됨.

### 적용: Handle (한글 퍼즐) — 무한형

```typescript
const handleConfig: GameScoringConfig = {
  mode: 'endless',
  halfScore: 3000, // 3,000 raw → 통합 5,000점
};
```

| 시나리오             | Raw     | 정규화 계산                   | 통합 점수 |
| -------------------- | ------- | ----------------------------- | --------- |
| Easy 1라운드 클리어  | 1,500   | 10,000 x 1500/(1500+3000)     | **3,333** |
| Easy 2라운드 클리어  | 3,000   | 10,000 x 3000/(3000+3000)     | **5,000** |
| Hard 1라운드 클리어  | 12,000  | 10,000 x 12000/(12000+3000)   | **8,000** |
| Hard 3라운드 클리어  | 36,000  | 10,000 x 36000/(36000+3000)   | **9,231** |
| Hard 10라운드 클리어 | 120,000 | 10,000 x 120000/(120000+3000) | **9,756** |
| 패배 (0 raw)         | 0       | 10,000 x 0/(0+3000)           | **0**     |

난이도 차등은 Handle 자체 배수(Easy 1x / Medium 3x / Hard 8x)로 이미 반영됨.

### 경험치 계산

정규화된 점수(0~10,000)를 기반으로 경험치를 계산한다.

```
scoreExp = normalizedScore × 0.01        (0~100 EXP)
playtimeExp = (playtimeSeconds / 60) × 2  (~10 EXP per 5min)
totalExp = max(scoreExp + playtimeExp, 1)  (최소 1 EXP)
```

| 시나리오            | 정규화 점수 | Score EXP | 플레이 5분 | 합계    |
| ------------------- | ----------- | --------- | ---------- | ------- |
| Kaboom Easy 평범    | 952         | 9         | 10         | **19**  |
| Kaboom Hard 완벽    | 10,000      | 100       | 10         | **110** |
| Handle Hard 1라운드 | 8,000       | 80        | 10         | **90**  |
| Handle Easy 1라운드 | 3,333       | 33        | 10         | **43**  |

레벨: `level = floor(totalExp / 100) + 1` (100 EXP당 1레벨)

### 데이터 흐름

1. 게임 종료 → iframe이 `GAME_OVER` postMessage 전송 (기존 형식 그대로)
2. `GamePlayer` 컴포넌트가 메시지 수신 및 Zod 검증
3. `POST /api/games/{gameId}/ranking`에 **raw score** 전송
4. API에서 게임 코드로 `scoringConfig` 조회 → 정규화 → 경험치 계산
5. Ranking 테이블에 raw score upsert (최고 점수만 유지)
6. User.exp에 경험치 반영

### 에러 처리

| 시나리오                     | 대응                                |
| ---------------------------- | ----------------------------------- |
| scoringConfig 없는 게임      | raw score를 그대로 사용 (하위 호환) |
| 정규화 점수 > 10,000 (fixed) | 10,000으로 클램프                   |
| raw score가 음수             | 0으로 클램프                        |
| raw score가 숫자가 아님      | API에서 400 에러                    |

## 새 게임 등록 가이드라인

### 1단계: 게임 유형 결정

| 유형    | 조건                                               | 예시                        |
| ------- | -------------------------------------------------- | --------------------------- |
| fixed   | 클리어 조건이 있고, 이론상 최고 점수가 정해져 있음 | 지뢰찾기, 퍼즐, 리듬 게임   |
| endless | 실패할 때까지 계속하고, 점수 상한이 없음           | 무한 라운드, 러너, 서바이벌 |

### 2단계: 파라미터 설정

#### fixed 게임

`maxRawScore` = 가장 어려운 난이도에서 이론상 최고 점수

```typescript
// 예: 리듬 게임 — Hard 올퍼펙트 = 8,000점
const rhythmConfig: GameScoringConfig = {
  mode: 'fixed',
  maxRawScore: 8000,
};
```

#### endless 게임

`halfScore` = "중급 실력자가 받을 법한 점수" 기준으로 설정

```typescript
// 예: 서바이벌 게임 — 평균 플레이어가 ~2,000점 정도
const survivalConfig: GameScoringConfig = {
  mode: 'endless',
  halfScore: 2000,
};
```

### 3단계: 게임 자체 점수 설계

플랫폼이 관여하지 않는, 게임 자체에서 결정할 사항:

- **난이도 차등**: 게임 자체 점수 공식에서 난이도 배수 적용 (Easy 1x, Hard 3x 등)
- **패배 부분점수**: 패배해도 진행도에 비례한 점수를 주고 싶으면 게임 자체에서 처리
- **시간 보너스/페널티**: 게임 자체 점수 공식에서 처리

## 구현 참고

### 변경된 파일

- `src/constants/scoring.ts` (신규) — 정규화 함수, 게임별 config
- `src/constants/exp.ts` — 정규화 점수 기반 EXP 계산 (multiplier 0.1 → 0.01)
- `src/app/api/games/[id]/ranking/route.ts` — raw score 저장 + 정규화 EXP 계산

### 변경 없는 것

- `src/components/game/game-player.tsx` — 변경 없음
- `src/components/game/game-message-schema.ts` — 프로토콜 변경 없음
- 게임 측 코드 — GAME_OVER 메시지 형식 변경 없음

### 하위 호환

scoringConfig가 등록되지 않은 게임은 raw score를 그대로 EXP 계산에 사용한다.
