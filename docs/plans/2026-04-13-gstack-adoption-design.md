# gstack 워크플로우 도입 설계

## 개요

gstack(Garry Tan의 Claude Code 워크플로우 프레임워크)에서 영감을 받아, Game Park의 기존 에이전트/커맨드 체계에 **팔란티어식 Think → Plan → Build → Review → Ship** 워크플로우를 도입한다.

## 배경

### 왜 필요한가

- 소규모 팀에서 PM, QA, 릴리즈 매니저, 디자인 판단 역할이 비어 있다
- 코드 작성(Build) 전후의 검증 단계가 부족하다
- 구조화된 사고방식(팔란티어식 문제 분해)을 일하는 습관으로 체득하고 싶다

### gstack이란

Y Combinator 대표 Garry Tan이 2026년 3월 오픈소스로 공개한 Claude Code 워크플로우 프레임워크. 슬래시 커맨드 기반으로 Claude에게 역할별 페르소나를 부여하여 "가상 개발팀"을 구성한다. GitHub 50,000+ 스타.

### 접근 방식

gstack을 그대로 포크하지 않고, **기존 체계를 유지하면서 핵심 역할만 추가**한다.

- 기존 23개 커맨드, 6개 에이전트를 100% 유지
- Think, Review(QA), Ship 단계에 새 역할 3개 추가
- ui-designer 에이전트 역량 강화

## 설계

### 아키텍처: 워크플로우 매핑

```
Think        →  Plan         →  Build      →  Review       →  Ship
(문제 정의)     (설계)          (구현)        (검증)          (배포)
────────────────────────────────────────────────────────────────────
/office-hours → /brainstorm  → /code:*     → /qa           → /release
                                             /review
                                             /validate
```

기존 워크플로우 앞뒤에 역할을 추가하는 구조:

- **앞에 Think 추가**: 코드 작성 전에 "왜 이걸 만드는가?" 질문
- **뒤에 QA + Release 추가**: 코드 완성 후 "진짜 작동하는가?" + "안전하게 배포할 수 있는가?" 검증

### 파일 구조

```
.claude/
├── agents/
│   ├── (기존 6개 유지)
│   ├── product-advisor.md    ← 신규: 제품 판단 전문가
│   ├── qa-engineer.md        ← 신규: QA 전문가
│   └── release-manager.md    ← 신규: 릴리즈 전문가
├── commands/
│   ├── dev/
│   │   ├── (기존 유지)
│   │   ├── office-hours.md   ← 신규: Think 단계
│   │   └── qa.md             ← 신규: QA 단계
│   └── git/
│       ├── (기존 유지)
│       └── release.md        ← 신규: Ship 단계
```

### 역할 상세

#### 1. Product Advisor (Think 단계)

**페르소나**: 팔란티어의 FDE(Forward Deployed Engineer) 겸 PM. 기술을 알지만 항상 비즈니스 임팩트부터 따진다.

**`/office-hours` 커맨드:**

- 입력: 아이디어나 기능 요청
- Product Advisor가 묻는 것들:
  1. 이 기능이 해결하는 사용자 문제는?
  2. 만들지 않으면 어떤 일이 생기는가?
  3. 가장 작은 형태로 검증할 수 있는 방법은?
  4. 경쟁 플랫폼(itch.io, CrazyGames 등)은 어떻게 하고 있나?
- 출력:
  - Go / No-Go / Pivot 판정
  - Go: 핵심 가치 한 줄, 성공 지표, 최소 범위 정의
  - Pivot: 대안 제시

**게임 플랫폼 특화**: 게임 사용자 리텐션, DAU, 플레이 시간 같은 게임 플랫폼 지표를 기준으로 판단.

#### 2. QA Engineer (Review 단계)

**페르소나**: 까다로운 QA 엔지니어. 개발자가 "되는데요"라고 하면 "어떤 환경에서요?"라고 반문한다.

**`/qa` 커맨드:**

- 입력: `/qa` (변경사항 자동 감지) 또는 `/qa src/app/[locale]/(main)/games/`
- QA Engineer가 하는 것들:
  1. 변경된 코드 분석 → 영향 범위 파악
  2. 테스트 시나리오 작성 (Happy Path + Edge Cases)
  3. E2E 테스트 존재 여부 확인 및 실행
  4. 게임 플랫폼 특화 검증 (iframe, 점수 제출, 반응형)
  5. 체크리스트 리포트 출력
- 출력: PASS / FAIL / WARN 판정 + 실패 항목별 재현 시나리오 + 수정 제안

#### 3. Release Manager (Ship 단계)

**페르소나**: 신중한 릴리즈 엔지니어. 배포는 코드 완성이 아니라 사용자에게 가치를 전달하는 행위라고 믿는다.

**`/release` 커맨드:**

- 입력: `/release` 또는 `/release v1.2.0`
- Release Manager가 하는 것들:
  1. develop 브랜치 대비 변경사항 전체 분석
  2. 배포 전 체크리스트 (type-check, lint, knip, 테스트, .env 변경 경고)
  3. 릴리즈 노트 초안 작성 (커밋 기반)
  4. PR 생성 또는 기존 `/pr` 커맨드로 위임
- 출력: READY / NOT READY 판정 + 릴리즈 노트 초안 + 블로커 목록

#### 4. UI Designer 강화

기존 `ui-designer.md`에 추가할 역량:

- 경쟁사 비교: WebSearch로 itch.io, CrazyGames, Poki의 동일 기능 UI 참조
- 사용성 휴리스틱: Nielsen의 10가지 사용성 원칙 기반 자기 검증
- 접근성 체크 강화: WCAG 2.1 AA 기준 색상 대비, 키보드 네비게이션

### 워크플로우 통합

#### 상황별 사용 흐름

```
[새 기능 개발]
/office-hours → /brainstorm → /code:design → /code:page → /qa → /validate → /commit → /release → /pr

[버그 수정]
/qa (재현 확인) → 수정 → /qa (검증) → /validate → /commit → /push

[UI 개선]
/office-hours (정말 필요한가?) → /code:design → /qa (반응형/접근성) → /commit

[긴급 핫픽스]
수정 → /validate → /qa → /commit → /release → /pr
```

### 산출물

| 파일                                   | 유형 | 설명                         |
| -------------------------------------- | ---- | ---------------------------- |
| `.claude/agents/product-advisor.md`    | 신규 | 제품 판단 에이전트           |
| `.claude/agents/qa-engineer.md`        | 신규 | QA 에이전트                  |
| `.claude/agents/release-manager.md`    | 신규 | 릴리즈 에이전트              |
| `.claude/commands/dev/office-hours.md` | 신규 | Think 단계 커맨드            |
| `.claude/commands/dev/qa.md`           | 신규 | QA 단계 커맨드               |
| `.claude/commands/git/release.md`      | 신규 | Ship 단계 커맨드             |
| `docs/gstack-workflow.md`              | 신규 | 사용 가이드 문서             |
| `CLAUDE.md`                            | 수정 | 워크플로우 섹션 업데이트     |
| `.claude/agents/ui-designer.md`        | 수정 | 경쟁사 분석/사용성 검증 추가 |

## 정량적 효과 분석

### 소프트웨어 개발 라이프사이클 커버리지

| 단계                        | 현재                    | 도입 후              | 변화                           |
| --------------------------- | ----------------------- | -------------------- | ------------------------------ |
| Think (문제 정의/제품 판단) | 없음                    | `/office-hours`      | 0% → 100%                      |
| Plan (설계)                 | `/brainstorm`           | `/brainstorm` (유지) | 100%                           |
| Build (구현)                | `/code:*` 13개          | 동일 (유지)          | 100%                           |
| Review (검증)               | `/review` + `/validate` | + `/qa` 추가         | 정적 검증만 → 정적 + 동적 검증 |
| Ship (배포)                 | `/push` + `/pr`         | + `/release` 추가    | 코드 전달만 → 릴리즈 프로세스  |

**라이프사이클 커버리지: 3/5 단계 (60%) → 5/5 단계 (100%)**

### 역할 커버리지

| 역할          | 현재                    | 도입 후                   |
| ------------- | ----------------------- | ------------------------- |
| PM/기획자     | 없음                    | product-advisor           |
| 디자이너      | ui-designer (구현 중심) | ui-designer (판단력 강화) |
| 개발자        | implementer             | implementer (유지)        |
| 코드 리뷰어   | code-reviewer           | code-reviewer (유지)      |
| QA 엔지니어   | 없음                    | qa-engineer               |
| 테스트 실행   | test-runner             | test-runner (유지)        |
| 릴리즈 매니저 | 없음                    | release-manager           |
| 문서 작성자   | doc-writer              | doc-writer (유지)         |
| 게임 통합     | game-integrator         | game-integrator (유지)    |

**에이전트 역할: 6개 → 9개 (50% 증가), 빈 역할: 4개 → 0개**

### 품질 게이트

| 게이트                             | 현재          | 도입 후         |
| ---------------------------------- | ------------- | --------------- |
| 제품 타당성 검증                   | -             | `/office-hours` |
| 설계 리뷰                          | `/brainstorm` | `/brainstorm`   |
| 코드 리뷰                          | `/review`     | `/review`       |
| 정적 분석 (type-check, lint, knip) | `/validate`   | `/validate`     |
| 동적 QA (시나리오 기반)            | -             | `/qa`           |
| 배포 전 체크리스트                 | -             | `/release`      |
| Pre-commit hooks                   | 5단계         | 5단계           |

**품질 게이트: 4개 → 7개 (75% 증가)**

### 결함 포착 시점

결함은 늦게 발견할수록 수정 비용이 기하급수적으로 증가한다 (Barry Boehm의 법칙).

```
현재:        Plan → Build → [Review] → Ship
             결함 포착 시작 ──┘

도입 후:  [Think] → Plan → Build → [QA] → [Review] → [Release] → Ship
          ↑ 여기서부터 포착            ↑ 동적 검증 추가    ↑ 최종 관문
```

| 결함 유형      | 현재 포착 시점           | 도입 후 포착 시점         |
| -------------- | ------------------------ | ------------------------- |
| 불필요한 기능  | 배포 후 (사용자 피드백)  | Think 단계 (office-hours) |
| UI/UX 문제     | 배포 후                  | QA 단계 (qa-engineer)     |
| 런타임 버그    | 배포 후 또는 수동 테스트 | QA 단계                   |
| 코드 품질      | Review 단계              | Review 단계 (동일)        |
| 타입/린트 에러 | Validate 단계            | Validate 단계 (동일)      |
| 배포 설정 누락 | 배포 후                  | Release 단계              |

**배포 후에야 발견되던 결함 3가지 유형을 배포 전에 포착 가능**

### 종합 요약

| 지표                  | 현재 | 도입 후 | 개선      |
| --------------------- | ---- | ------- | --------- |
| 라이프사이클 커버리지 | 60%  | 100%    | +40%p     |
| 에이전트 역할         | 6개  | 9개     | +50%      |
| 빈 역할               | 4개  | 0개     | 해소      |
| 품질 게이트           | 4개  | 7개     | +75%      |
| 슬래시 커맨드         | 23개 | 26개    | +3개      |
| 사전 결함 포착 유형   | 2개  | 5개     | +150%     |
| 신규 파일             | -    | 7개     | 최소 변경 |
| 기존 파일 수정        | -    | 2개     | 비파괴적  |

## 구현 참고

- 기존 에이전트/커맨드 파일 구조와 동일한 형식으로 작성
- 에이전트: Markdown frontmatter (name, description, model, tools)
- 커맨드: Markdown 문서 (사용법, 실행 절차, 주의사항)
- 문서화: `docs/gstack-workflow.md`에 사용 가이드 통합
