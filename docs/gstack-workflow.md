# Game Park 워크플로우 가이드

> Think → Plan → Build → Review → Ship

## 목차

1. [철학: Think → Plan → Build → Review → Ship](#1-철학-think--plan--build--review--ship)
2. [역할 카드](#2-역할-카드)
3. [워크플로우 맵](#3-워크플로우-맵)
4. [실전 예시: Game Park 시나리오](#4-실전-예시-game-park-시나리오)
5. [팁 & 안티패턴](#5-팁--안티패턴)
6. [커맨드 레퍼런스](#6-커맨드-레퍼런스)
7. [정량적 효과](#7-정량적-효과)

---

## 1. 철학: Think → Plan → Build → Review → Ship

### 왜 구조화된 사고가 필요한가

Game Park는 브라우저 기반 웹 게임 플랫폼이다. iframe 통신, 점수 시스템, 실시간 랭킹, 게임 생명주기 관리 등 복잡한 도메인을 다룬다. "일단 만들고 보자"는 접근은 통합 버그, 보안 취약점, 사용자 경험 저하로 이어진다.

Palantir의 Forward Deployed Engineer(FDE) 방식에서 영감을 받았다. FDE는 "만들 수 있는가"보다 **"만들어야 하는가"**를 먼저 묻는다. 코드 한 줄을 작성하기 전에 문제를 분해하고, 임팩트를 측정하고, 최소 범위를 정의한다.

### 5단계 파이프라인

각 단계는 하나의 핵심 질문에 답한다.

```
Think ──→ Plan ──→ Build ──→ Review ──→ Ship
  │         │        │         │         │
  ▼         ▼        ▼         ▼         ▼
만들어야   어떻게    만든다    올바른가   배포해도
 하는가?   만들까?              ?       안전한가?
```

#### Think — "만들어야 하는가?"

코드를 작성하기 전에 비즈니스 임팩트를 검증한다. 사용자 문제를 정의하고, 핵심 지표(리텐션, DAU, 플레이 타임)에 미치는 영향을 분석하고, 경쟁 플랫폼(itch.io, CrazyGames, Poki)을 조사한다. 결과는 Go / No-Go / Pivot 세 가지 중 하나다.

- **담당**: product-advisor
- **커맨드**: `/office-hours`
- **출력**: 제품 검증 보고서 (Go / No-Go / Pivot 판단)

#### Plan — "어떻게 만들까?"

Go 판단이 나오면 기술 설계로 넘어간다. 아키텍처, 컴포넌트, 데이터 흐름, 에러 처리, 테스트 전략을 2-3가지 접근법으로 비교한다. 설계가 승인되면 `docs/plans/`에 문서를 저장한다.

- **담당**: ui-designer (UI), implementer (구현 계획)
- **커맨드**: `/brainstorm`, `/code:design`
- **출력**: 설계 문서, 와이어프레임

#### Build — "만든다"

승인된 설계를 코드로 구현한다. 프로젝트 컨벤션(화살표 함수, named export, CVA + cn())을 준수하고, 기존 공통 컴포넌트를 최대한 재사용한다.

- **담당**: implementer, game-integrator
- **커맨드**: `/code:page`, `/code:component`, `/code:hook`, `/code:api`, `/code:game`, `/code:schema`, `/code:story`, `/code:feature`, `/code:socket`, `/code:admin`, `/code:figma`, `/code:test`
- **출력**: 구현된 코드, 테스트, Storybook 스토리

#### Review — "올바른가?"

구현된 코드를 세 가지 관점에서 검증한다. 코드 품질(정적 리뷰), 기능 동작(시나리오 QA), 정적 분석(lint, type-check, knip).

- **담당**: code-reviewer (코드 리뷰), qa-engineer (QA), test-runner (테스트)
- **커맨드**: `/review`, `/qa`, `/validate`, `/review-branch`
- **출력**: 리뷰 결과, QA 판정(PASS/WARN/FAIL), 검증 결과

#### Ship — "배포해도 안전한가?"

배포 전 최종 안전 게이트다. 8개 체크리스트(TypeScript, ESLint, Knip, 테스트, 미커밋 변경, .env, 패키지, DB 스키마)를 검증하고, 릴리즈 노트를 생성하고, PR을 만든다.

- **담당**: release-manager, doc-writer
- **커맨드**: `/release`, `/commit`, `/push`, `/pr`
- **출력**: 릴리즈 노트, PR, 배포 준비 판정(READY/NOT READY)

---

## 2. 역할 카드

9개의 전문 에이전트가 각 단계를 담당한다. 각 에이전트는 명확한 책임과 출력물을 가진다.

| #   | 에이전트            | 페르소나                               | 담당 단계  | 책임                                                                        | 출력물                                 |
| --- | ------------------- | -------------------------------------- | ---------- | --------------------------------------------------------------------------- | -------------------------------------- |
| 1   | **product-advisor** | Palantir FDE 관점의 제품 전략가        | Think      | "만들어야 하는가?"를 판단. 비즈니스 임팩트 분석, 경쟁 조사, 스코프 최소화   | Go/No-Go/Pivot 판단 보고서             |
| 2   | **ui-designer**     | 디자이너 겸 프론트엔드 개발자          | Plan/Build | 디자이너 없는 환경에서 일관된 UI 설계 및 구현. 와이어프레임, 반응형, 접근성 | UI 설계 문서, 와이어프레임, 구현 코드  |
| 3   | **implementer**     | 구현 전문가                            | Build      | 설계를 코드로 변환. 컨벤션 준수, 기존 코드 재사용, 자기 검토                | 구현된 코드, 검증 결과                 |
| 4   | **code-reviewer**   | 시니어 코드 리뷰어                     | Review     | 프로젝트 컨벤션 기준 심층 리뷰. Critical/Important/Minor 분류               | 코드 리뷰 결과 (이슈 목록 + 수정 방안) |
| 5   | **test-runner**     | 테스트 전문가                          | Review     | 테스트 실행, 실패 원인 분석, 수정 방안 제시                                 | 테스트 결과 (통과/실패 + 원인 분석)    |
| 6   | **qa-engineer**     | "내 컴퓨터에서는 됩니다"를 의심하는 QA | Review     | 시나리오 기반 동적 결함 검증. 영향 범위 분석, 게임 플랫폼 특화 검증         | QA 판정 (PASS/WARN/FAIL)               |
| 7   | **release-manager** | 신중한 릴리즈 엔지니어                 | Ship       | 배포 전 최종 검증 게이트. 8개 체크리스트, 릴리즈 노트, PR 생성              | 릴리즈 검증 결과 + PR                  |
| 8   | **doc-writer**      | 기술 문서 작성 전문가                  | Ship       | 설계 문서, API 문서, 가이드 작성. 한국어, 코드 예시 포함                    | 문서 (docs/)                           |
| 9   | **game-integrator** | iframe 게임 통합 전문가                | Build      | postMessage 통신, 게임 생명주기, 점수 제출, 보안 검증                       | 게임 통합 코드 + 보안 체크 결과        |

### 에이전트 간 관계

```
product-advisor ──Go──→ ui-designer ──→ implementer ──→ code-reviewer
     (Think)              (Plan)         (Build)         (Review)
                                            │
                                     game-integrator     qa-engineer
                                      (게임 관련 시)       (Review)
                                                            │
                                            test-runner ←───┘
                                             (Review)
                                                │
                                         release-manager
                                             (Ship)
                                                │
                                           doc-writer
                                            (Ship)
```

---

## 3. 워크플로우 맵

### 의사결정 트리: "지금 어떤 상황인가?"

```
시작
 │
 ├─ 새로운 기능을 만들고 싶다
 │   └─→ 새 기능 개발 워크플로우
 │
 ├─ 버그를 발견했다
 │   └─→ 버그 수정 워크플로우
 │
 ├─ 기존 UI를 개선하고 싶다
 │   └─→ UI 개선 워크플로우
 │
 └─ 프로덕션에 긴급 문제가 있다
     └─→ 긴급 핫픽스 워크플로우
```

### 워크플로우 1: 새 기능 개발

전체 파이프라인을 처음부터 끝까지 따른다.

```
/office-hours "리더보드 친구 필터"     ← Think: 만들어야 하는가?
       │
       ▼ (Go 판단)
/brainstorm 리더보드 친구 필터         ← Plan: 어떻게 만들까?
       │
       ▼ (설계 승인)
/code:design 친구 필터 UI              ← Plan: UI 와이어프레임
       │
       ▼ (와이어프레임 승인)
/code:page + /code:component           ← Build: 코드 구현
       │
       ▼ (구현 완료)
/qa                                    ← Review: 시나리오 QA
       │
       ▼ (PASS)
/validate --fix                        ← Review: 정적 분석
       │
       ▼ (통과)
/commit                                ← Ship: 커밋
       │
       ▼
/release                               ← Ship: 릴리즈 검증 + PR
       │
       ▼ (READY)
/pr (release가 자동 생성)              ← Ship: PR 생성
```

**소요 커맨드**: 8-10개 | **적합한 상황**: 새로운 기능, 큰 변경, 불확실한 요구사항

### 워크플로우 2: 버그 수정

Think 단계를 건너뛰고 바로 수정한다.

```
/qa src/app/.../affected-page          ← Review: 버그 재현 및 영향 범위 분석
       │
       ▼ (버그 확인)
코드 수정                              ← Build: 직접 수정
       │
       ▼
/qa                                    ← Review: 수정 검증
       │
       ▼ (PASS)
/validate --fix                        ← Review: 정적 분석
       │
       ▼
/commit                                ← Ship: 커밋
       │
       ▼
/push                                  ← Ship: 푸시
```

**소요 커맨드**: 5개 | **적합한 상황**: 이미 있는 기능의 오작동, 명확한 버그

### 워크플로우 3: UI 개선

기존 기능의 외형을 개선한다. 비즈니스 판단이 필요할 수 있다.

```
/office-hours "게임 카드 디자인 개선"  ← Think: 개선할 가치가 있는가?
       │
       ▼ (Go 판단)
/code:design 게임 카드 리디자인        ← Plan + Build: UI 설계 및 구현
       │
       ▼
/qa                                    ← Review: 시나리오 QA
       │
       ▼ (PASS)
/commit                                ← Ship: 커밋
```

**소요 커맨드**: 4개 | **적합한 상황**: 디자인 개선, 레이아웃 변경, UX 향상

### 워크플로우 4: 긴급 핫픽스

검증을 최소한으로 줄이고 빠르게 배포한다.

```
코드 수정                              ← Build: 최소 범위 수정
       │
       ▼
/validate --fix                        ← Review: 정적 분석 (필수)
       │
       ▼
/qa                                    ← Review: 영향 범위 확인 (필수)
       │
       ▼ (PASS)
/commit                                ← Ship: 커밋
       │
       ▼
/release                               ← Ship: 릴리즈 검증 + PR
       │
       ▼ (READY)
/pr (release가 자동 생성)              ← Ship: PR 생성
```

**소요 커맨드**: 5개 | **적합한 상황**: 프로덕션 장애, 보안 취약점, 크리티컬 버그

### 워크플로우 선택 기준

| 상황             | 워크플로우          | /office-hours | /brainstorm | /qa | /release |
| ---------------- | ------------------- | :-----------: | :---------: | :-: | :------: |
| 새 기능 (불확실) | 새 기능 개발        |       O       |      O      |  O  |    O     |
| 새 기능 (명확)   | 새 기능 개발 (간소) |       -       |      O      |  O  |    O     |
| 버그 수정        | 버그 수정           |       -       |      -      |  O  |    -     |
| UI 개선          | UI 개선             |      O/-      |      -      |  O  |    -     |
| 긴급 핫픽스      | 긴급 핫픽스         |       -       |      -      |  O  |    O     |
| 문서/설정 변경   | (직접)              |       -       |      -      |  -  |    -     |
| 리팩터링         | (직접)              |       -       |      -      | O/- |    -     |

---

## 4. 실전 예시: Game Park 시나리오

### 시나리오 1: "리더보드에 친구 필터 추가하고 싶어"

요구사항이 불확실한 새 기능이다. Think부터 Ship까지 전체 파이프라인을 따른다.

#### Think 단계

```
/office-hours 리더보드 친구 필터
```

product-advisor가 5단계 검증을 수행한다.

- **문제 정의**: "리더보드에서 친구의 점수만 보고 싶은 사용자가 있다"
- **임팩트 분석**: 사용자 리텐션(높음 — 경쟁 동기 부여), DAU(중간), 플레이 타임(높음 — 친구와 경쟁)
- **경쟁 분석**: CrazyGames에 유사 기능 있음, itch.io에는 없음
- **스코프**: MVP는 "친구 목록 기반 필터 토글" 하나. 친구 추가 기능은 별도 프로젝트
- **판단**: **Go** — 리텐션 기여 높고, 기존 Rank 모델 활용 가능, 1주 내 MVP 가능

#### Plan 단계

```
/brainstorm 리더보드 친구 필터
```

2-3가지 접근법을 비교한다.

- **접근법 A**: 클라이언트 필터링 — 전체 랭킹 데이터를 받아서 프론트에서 필터 (간단하지만 데이터 커짐)
- **접근법 B**: 서버 필터링 — API에서 친구 ID 기반 쿼리 (효율적, 추천)
- **접근법 C**: 별도 친구 랭킹 API — 전용 엔드포인트 (오버엔지니어링)

접근법 B로 결정. 설계 문서를 `docs/plans/2026-04-13-leaderboard-friend-filter.md`에 저장한다.

```
/code:design 랭킹 페이지 - 전체/친구 탭 전환, 기존 랭킹 테이블 재사용
```

ASCII 와이어프레임을 제시하고 승인받는다.

#### Build 단계

```
/code:page /games/[id]/ranking
/code:component FriendFilterTab
/code:api /api/games/[id]/ranking?filter=friends
/code:test src/components/common/friend-filter-tab.tsx
```

implementer가 컨벤션을 준수하며 구현한다. 기존 `ranking-table.tsx`를 재사용한다.

#### Review 단계

```
/qa
```

qa-engineer가 시나리오 기반 검증을 수행한다.

- Happy Path: 친구 필터 토글 시 친구 점수만 표시
- Edge Case: 친구가 0명일 때 빈 상태 표시
- Edge Case: 비로그인 상태에서 필터 클릭 시 로그인 유도
- Regression: 기존 전체 랭킹이 정상 동작하는지

```
/validate --fix
```

lint, type-check, knip 통과 확인.

#### Ship 단계

```
/commit
```

`[feat] 리더보드 친구 필터 기능 추가`

```
/release
```

release-manager가 8개 체크리스트를 검증하고 READY 판정이 나오면 PR을 자동 생성한다.

---

### 시나리오 2: "게임 로딩이 느리다는 피드백"

성능 버그다. Think 단계 없이 바로 디버깅한다.

#### Review 단계 (재현)

```
/qa src/app/(fullscreen)/play/
```

qa-engineer가 영향 범위를 분석한다.

- 게임 플레이 페이지의 iframe 로딩 과정 추적
- READY 메시지 수신까지의 타임라인 분석
- 네트워크 타임아웃, CloudFront 캐시 미스, 대용량 에셋 등 원인 후보 도출

결과: iframe src에 캐시 버스팅 파라미터가 매번 새로 생성되어 CDN 캐시를 무효화하고 있었다.

#### Build 단계 (수정)

iframe src 생성 로직에서 불필요한 캐시 버스팅 파라미터를 제거한다.

#### Review 단계 (검증)

```
/qa
```

수정 후 재검증. READY 타임아웃(10초) 내에 게임이 정상 로드되는지 확인한다.

```
/validate --fix
```

#### Ship 단계

```
/commit
```

`[bugfix] 게임 iframe 로딩 시 불필요한 캐시 버스팅 제거`

```
/push
```

---

### 시나리오 3: "itch.io처럼 게임 태그 시스템 넣자"

경쟁사에서 영감을 받은 기능이다. Think 단계에서 맹목적 복제를 방지한다.

#### Think 단계

```
/office-hours 게임 태그 시스템
```

product-advisor가 경쟁 분석을 중점적으로 수행한다.

- **경쟁 분석**: itch.io의 태그 시스템은 개발자가 직접 태그를 설정하고, 사용자가 태그로 검색한다. CrazyGames는 관리자가 카테고리를 관리한다. Poki는 자동 분류 + 수동 큐레이션을 혼합한다.
- **Game Park 맥락**: 현재 Genre 모델로 1차 분류가 되어 있다. 게임 수가 아직 적어서 태그 시스템의 ROI가 낮다.
- **판단**: **Pivot** — 태그 시스템 대신, 기존 Genre에 서브카테고리(예: "퍼즐 > 물리 퍼즐")를 추가하는 것이 현재 규모에 적합하다. 게임 수가 50개를 넘으면 태그 시스템을 재검토한다.

#### Plan 단계 (피벗된 방향)

```
/brainstorm 장르 서브카테고리
```

Genre 모델에 `parentGenreCode` 필드를 추가하는 설계를 진행한다.

```
/code:design 장르 필터 - 2단계 드롭다운, 현재 칩 필터 확장
```

#### Build → Review → Ship

피벗된 MVP에 맞춰 나머지 파이프라인을 진행한다.

```
/code:schema modify Genre              # parentGenreCode 필드 추가
/code:component GenreSubFilter          # 서브카테고리 필터 UI
/qa                                     # 시나리오 검증
/validate --fix                         # 정적 분석
/commit                                 # [feat] 장르 서브카테고리 필터 추가
/release                                # 릴리즈 검증 + PR
```

---

## 5. 팁 & 안티패턴

### 효과적인 사용법

1. **`/office-hours`는 30초면 끝날 수도 있다** — 사용자가 이미 명확한 근거를 가지고 있다면 분석 단계를 줄여도 된다. "이 기능은 사용자 피드백에서 나왔고, 기존 코드를 재사용할 수 있다"고 말하면 빠르게 Go 판단이 난다.

2. **`/qa`와 `/review`는 목적이 다르다** — `/qa`는 "사용자 관점에서 동작하는가?"를 묻고, `/review`는 "개발자 관점에서 코드가 올바른가?"를 묻는다. 둘 다 사용하면 커버리지가 넓어진다. 시간이 없으면 `/qa`를 우선한다.

3. **`/release`는 `/pr`의 상위 호환이다** — 기능 개발 완료 후에는 `/release`를 사용한다. 8개 체크리스트를 자동으로 검증하고 PR까지 생성한다. 단순 문서/설정 변경에만 `/pr`을 직접 사용한다.

4. **`/validate --fix`를 습관적으로 사용한다** — 커밋 전에 항상 실행한다. lint 에러를 자동으로 수정하고 Prettier 포맷팅도 함께 처리한다. pre-commit hook에서 실패하는 것보다 미리 잡는 게 낫다.

5. **커맨드를 조합한다** — `/brainstorm`으로 설계가 끝나면 바로 "구현 시작할까요?"라고 물어온다. 자연스럽게 `/code:page`와 `/code:component`로 이어진다. 파이프라인은 경직된 절차가 아니라 유연한 흐름이다.

6. **`/review-branch`로 동료 코드를 리뷰한다** — PR 번호나 브랜치명을 넘기면 워크트리를 분리하여 현재 작업에 영향 없이 리뷰한다. `git stash` 없이 동료 코드를 검토할 수 있다.

7. **`/code:test`를 Build 단계에서 함께 실행한다** — 구현과 테스트를 동시에 작성하면 Review 단계에서 시간이 절약된다. qa-engineer가 커버리지 갭을 지적하기 전에 미리 채운다.

8. **게임 관련 작업에는 `/code:game`을 사용한다** — 일반 `/code:page`와 달리 `docs/game-integration.md` 프로토콜을 자동으로 읽고, iframe/postMessage/점수 제출 보일러플레이트를 생성한다.

### 피해야 할 것들

1. **Think 없이 Build하기** — "간단한 기능이니까 바로 만들자"는 가장 흔한 실수다. 간단해 보이는 기능이 기존 시스템과 충돌하거나, 만들어놓고 안 쓰게 되는 경우가 많다. 버그 수정, 문서 변경, 리팩터링이 아니라면 최소한 "이 기능이 지표에 기여하는가?"를 한 번은 묻는다.

2. **`/qa` 없이 Ship하기** — `/validate`는 정적 분석이다. lint와 type-check가 통과해도 런타임 버그, 통합 결함, 회귀 버그는 잡지 못한다. `/qa`의 시나리오 기반 검증이 이 gap을 메운다.

3. **경쟁사 기능을 그대로 복제하기** — "itch.io에 있으니까 우리도 넣자"는 판단 근거가 아니다. `/office-hours`의 경쟁 분석은 "그 기능이 효과가 있는가?"와 "Game Park 맥락에서도 유효한가?"를 묻는다.

4. **스코프 크리프 허용하기** — `/brainstorm`에서 "이것도 있으면 좋겠다"는 기능을 슬쩍 추가하지 않는다. MVP를 넘어서는 기능은 별도 프로젝트로 분리한다. 1주 스코프를 넘기면 분할한다.

5. **에이전트 역할을 혼용하기** — product-advisor에게 코드를 작성하게 하거나, implementer에게 비즈니스 판단을 맡기지 않는다. 각 에이전트는 명확한 책임 경계가 있다.

6. **`/release` 대신 항상 `/pr`만 사용하기** — `/pr`은 검증 없이 PR을 생성한다. 기능 개발 완료 후에는 반드시 `/release`를 통해 8개 체크리스트를 검증한 뒤 PR을 만든다.

7. **Review 결과를 무시하기** — `/qa`에서 WARN 판정이 나왔는데 "나중에 고치자"고 넘어가지 않는다. WARN은 "지금은 동작하지만 문제가 될 수 있다"는 신호다. 최소한 이슈를 문서화한다.

---

## 6. 커맨드 레퍼런스

### Git 커맨드 (4개)

| 커맨드     | 설명                                                                                          | 단계 |
| ---------- | --------------------------------------------------------------------------------------------- | ---- |
| `/commit`  | 변경사항을 분석하고 `[level] 설명` 형식으로 커밋 생성. 여러 기능이 섞여 있으면 분리 커밋 제안 | Ship |
| `/push`    | 현재 브랜치의 커밋을 리모트에 푸시. 리모트 브랜치 없으면 자동으로 `-u` 플래그                 | Ship |
| `/pr`      | 변경사항을 분석하고 PR 템플릿에 맞춰 PR 생성. 검증 없이 바로 생성                             | Ship |
| `/release` | 8개 체크리스트 자동 검증 + 릴리즈 노트 생성 + PR 생성. READY/NOT READY 판정                   | Ship |

### Code 커맨드 (13개)

| 커맨드            | 설명                                                              | 단계       |
| ----------------- | ----------------------------------------------------------------- | ---------- |
| `/code:page`      | Next.js App Router 페이지 스캐폴딩 (page, layout, loading, error) | Build      |
| `/code:component` | 프로젝트 컨벤션에 맞는 컴포넌트 생성 (CVA + cn() 패턴)            | Build      |
| `/code:hook`      | 커스텀 React 훅 생성 (Options/Return 타입, useCallback)           | Build      |
| `/code:api`       | Next.js Route Handler 생성 (GET, POST, PUT, DELETE)               | Build      |
| `/code:test`      | Vitest + RTL 테스트 생성 (사용자 관점, 접근성 쿼리)               | Build      |
| `/code:story`     | Storybook CSF3 스토리 생성 (variants별 args 설정)                 | Build      |
| `/code:feature`   | Feature 모듈 구조 생성 (components, hooks, types, utils)          | Build      |
| `/code:game`      | 게임 관련 페이지/컴포넌트 스캐폴딩 (iframe, postMessage 포함)     | Build      |
| `/code:design`    | AI 주도 UI 설계 + 구현 (와이어프레임, 반응형, 다크모드)           | Plan/Build |
| `/code:schema`    | Prisma 스키마 변경 + 관련 타입, API 코드 생성                     | Build      |
| `/code:socket`    | Socket.io 이벤트 핸들러 및 클라이언트 훅 생성                     | Build      |
| `/code:admin`     | 어드민 패널 스캐폴딩 (게임 등록, 사용자 관리 등)                  | Build      |
| `/code:figma`     | Figma 디자인 URL에서 반응형 컴포넌트 자동 생성                    | Build      |

### Dev 커맨드 (8개)

| 커맨드           | 설명                                                                | 단계   |
| ---------------- | ------------------------------------------------------------------- | ------ |
| `/office-hours`  | "만들어야 하는가?" 제품 전략 판단. Go/No-Go/Pivot 결정              | Think  |
| `/brainstorm`    | 아이디어 브레인스토밍. 2-3가지 접근법 비교 후 설계 문서 저장        | Plan   |
| `/review`        | 현재 변경사항을 code-reviewer에게 위임하여 심층 리뷰                | Review |
| `/review-branch` | 동료 브랜치를 워크트리로 격리하여 코드 리뷰 (PR 번호 또는 브랜치명) | Review |
| `/qa`            | qa-engineer에게 위임하여 시나리오 기반 QA. PASS/WARN/FAIL 판정      | Review |
| `/validate`      | 전체 정적 검증 (type-check + lint + knip). `--fix`로 자동 수정      | Review |
| `/refactor`      | 기존 코드를 컨벤션에 맞게 리팩터링. 사용처 분석 + 사이드이펙트 예고 | Build  |
| `/seed`          | 데이터베이스 시드 데이터 실행 또는 리셋                             | Build  |

### 단계별 커맨드 요약

```
Think:   /office-hours
Plan:    /brainstorm, /code:design
Build:   /code:page, /code:component, /code:hook, /code:api, /code:test,
         /code:story, /code:feature, /code:game, /code:schema, /code:socket,
         /code:admin, /code:figma, /refactor, /seed
Review:  /qa, /review, /review-branch, /validate
Ship:    /commit, /push, /pr, /release
```

---

## 7. 정량적 효과

### Before vs After 비교

워크플로우 도입 전후의 개발 프로세스 변화를 정량화한다.

| 지표                       | Before                             | After                                                | 개선율 |
| -------------------------- | ---------------------------------- | ---------------------------------------------------- | ------ |
| **라이프사이클 커버리지**  | 60% (Build + Review 중심)          | 100% (Think → Ship 전 단계)                          | +67%   |
| **에이전트 역할 수**       | 6개                                | 9개 (+product-advisor, qa-engineer, release-manager) | +50%   |
| **품질 게이트 수**         | 4개 (lint, type-check, knip, test) | 7개 (+제품 검증, 시나리오 QA, 릴리즈 검증)           | +75%   |
| **배포 전 결함 탐지 유형** | 2개 (정적 분석, 단위 테스트)       | 5개 (+제품 판단 오류, 동적 결함, 배포 안전성)        | +150%  |

### 신규 게이트 상세

| #   | 게이트                   | 담당            | 잡아내는 결함                                               |
| --- | ------------------------ | --------------- | ----------------------------------------------------------- |
| 1   | **제품 검증** (Think)    | product-advisor | 불필요한 기능, 지표 기여 없는 작업, 스코프 크리프           |
| 2   | **시나리오 QA** (Review) | qa-engineer     | 런타임 에러, 통합 버그, 회귀, 접근성, iframe 통신 결함      |
| 3   | **릴리즈 검증** (Ship)   | release-manager | 미커밋 변경, .env 노출, DB 마이그레이션 누락, 패키지 불일치 |

### 단계별 결함 차단

```
Think     ─── 불필요한 기능 차단 (빌드 전 No-Go)
Plan      ─── 설계 결함 차단 (구현 전 접근법 비교)
Build     ─── 구현 결함 차단 (컨벤션 자동 준수)
Review    ─── 동적 결함 차단 (시나리오 QA + 코드 리뷰 + 정적 분석)
Ship      ─── 배포 결함 차단 (8개 체크리스트 + 릴리즈 노트)
```

가장 큰 변화는 **좌측 이동(shift-left)**이다. 기존에는 Build 이후에야 문제를 발견했지만, 이제는 Think 단계에서 "만들 필요가 없는 기능"을 걸러내고, Review 단계에서 정적 분석이 놓치는 동적 결함을 시나리오 기반으로 잡아낸다.
