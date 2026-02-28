# Claude Code 사용 가이드

> **이 문서는 팀원(사람)을 위한 가이드입니다.** Claude Code가 작업 중 자동으로 읽는 파일이 아닙니다.
>
> Claude Code의 동작을 제어하는 파일은 `CLAUDE.md`와 `.claude/` 디렉토리이며, 이 문서는 그 설정들이 **무엇이고, 어떻게 사용하는지** 팀원에게 설명하기 위해 존재합니다.
>
> 새로 합류한 팀원이나, 슬래시 명령어·자동화가 어떻게 동작하는지 궁금할 때 참고하세요.

---

## 목차

1. [개요](#1-개요)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [자동화 워크플로우](#3-자동화-워크플로우)
4. [슬래시 명령어 — 코드 생성](#4-슬래시-명령어--코드-생성)
5. [슬래시 명령어 — 개발 도구](#5-슬래시-명령어--개발-도구)
6. [슬래시 명령어 — Git](#6-슬래시-명령어--git)
7. [자동 학습 시스템](#7-자동-학습-시스템)
8. [팀 협업 가이드](#8-팀-협업-가이드)
9. [유지보수](#9-유지보수)

---

## 1. 개요

Claude Code는 AI 기반 코딩 어시스턴트입니다. 이 프로젝트에는 다음이 설정되어 있습니다:

| 구성 요소                    | 역할                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| `CLAUDE.md`                  | Claude가 **매 대화마다** 읽는 핵심 규칙 (항상 컨텍스트에 로드) |
| `docs/coding-conventions.md` | 전체 코딩 컨벤션 + 코드 예시 (코드 작업 시 Claude가 읽음)      |
| `docs/testing.md`            | 테스트 작성 가이드 (테스트 작업 시 Claude가 읽음)              |
| `.claude/commands/`          | 슬래시 명령어 14개 (해당 명령어 호출 시에만 로드)              |
| `.claude/memory/`            | Claude가 작업 중 발견한 지식 자동 기록                         |

### Claude가 정보를 읽는 순서

```
1. CLAUDE.md (항상 자동 로드)
   └── 핵심 규칙 + "코드 작업 프로토콜" 지시
       ├── 코드 작업 시 → docs/coding-conventions.md 읽기
       └── 테스트 작업 시 → docs/testing.md 읽기

2. 슬래시 명령어 호출 시 → 해당 .md 파일 로드
   └── 각 명령어에도 conventions 참조 지시 포함

3. 작업 중 → .claude/memory/ 참조 및 기록
```

---

## 2. 프로젝트 구조

```
.claude/
├── commands/
│   ├── git/
│   │   ├── commit.md        # /git:commit — 커밋 생성
│   │   ├── push.md          # /git:push — 안전한 푸시
│   │   └── pr.md            # /git:pr — PR 생성
│   ├── code/
│   │   ├── component.md     # /code:component — 컴포넌트 생성
│   │   ├── story.md         # /code:story — Storybook 스토리
│   │   ├── feature.md       # /code:feature — Feature 모듈
│   │   ├── page.md          # /code:page — Next.js 페이지
│   │   ├── api.md           # /code:api — API Route 핸들러
│   │   ├── socket.md        # /code:socket — Socket.io 핸들러
│   │   ├── hook.md          # /code:hook — 커스텀 훅
│   │   └── test.md          # /code:test — 테스트 생성
│   └── dev/
│       ├── validate.md      # /dev:validate — 전체 검증
│       ├── review.md        # /dev:review — 코드 리뷰
│       └── refactor.md      # /dev:refactor — 리팩터링
├── memory/
│   ├── _index.md            # 목차 + 핵심 요약
│   ├── patterns.md          # 코드 패턴
│   ├── pitfalls.md          # 실수와 해결법
│   ├── decisions.md         # 기술적 결정
│   └── dependencies.md      # 의존성 이슈
└── pr-rules.md              # PR 작성 규칙
```

---

## 3. 자동화 워크플로우

Claude Code는 코드를 작성할 때 자동으로 다음 워크플로우를 따릅니다:

### 코드 작업 프로토콜 (CLAUDE.md에 정의)

```
작성 전  ① docs/coding-conventions.md 읽기
         ② 테스트라면 docs/testing.md도 읽기

작성 중  ③ CLAUDE.md 규칙과 대조하며 작성

작성 후  ④ pnpm lint:fix && pnpm format 실행
         ⑤ 에러 시 수정 → ④ 반복 (에러 없을 때까지)
```

### 커밋 시 자동 검증 (pre-commit hook)

```
git commit 실행
  → 브랜치 이름 검증
  → .env 파일 방지
  → Knip (미사용 코드 검사)
  → TypeScript 타입 검사
  → lint-staged (ESLint + Prettier)
  → 하나라도 실패 시 커밋 거부
```

### 컴포넌트 작업 시 자동 체크 (CLAUDE.md에 정의)

```
컴포넌트 수정/생성 시 반드시:
  1. 사용처 확인 → 어디서 어떻게 쓰이는지 보고
  2. 사이드이펙트 예고 → 수정 전에 영향 범위 보고
  3. @/components 하위 공통 컴포넌트 확인
  4. @doubltworks/ 패키지 공통 컴포넌트 확인
```

---

## 4. 슬래시 명령어 — 코드 생성

### `/code:component` — 컴포넌트 생성

CVA + cn() 패턴으로 프로젝트 컨벤션에 맞는 컴포넌트를 생성합니다.

```
/code:component Button                    # src/components/common/에 생성
/code:component Button --ui               # src/components/ui/에 생성
/code:component CartItem --feature=cart   # src/features/cart/components/에 생성
```

**자동으로 적용되는 것:**

- kebab-case 파일명, PascalCase 컴포넌트명
- CVA variants + cn() className 병합
- interface Props 정의 (VariantProps 포함)
- named export, 화살표 함수 (Next.js 규약 파일은 `export default function` 허용)
- `docs/coding-conventions.md` 규칙 참조

---

### `/code:hook` — 커스텀 훅 생성

```
/code:hook useCart                         # src/hooks/에 생성
/code:hook useProductFilter --feature=products  # src/features/products/hooks/에 생성
```

**자동으로 적용되는 것:**

- `'use client'` 지시어
- Options/Return 타입 명시적 정의
- useCallback 메모이제이션
- 파일명: `use-{name}.ts`

---

### `/code:page` — Next.js 페이지 스캐폴딩

```
/code:page /products                       # page + layout + loading + error
/code:page /products/[id]                  # 동적 라우트 (params: Promise)
/code:page /checkout --minimal             # page.tsx만 생성
```

**생성 파일:** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

**자동으로 적용되는 것:**

- 동적 라우트 시 `params: Promise<>` 타입 (Next.js 15+)
- error.tsx에 `'use client'` 자동 추가
- 최대한 `'use server'`, 동적인 부분만 `'use client'`

---

### `/code:api` — API Route 핸들러 생성

```
/code:api /api/products GET,POST
/code:api /api/products/[id] GET,PUT,DELETE
```

**자동으로 적용되는 것:**

- HTTP 메서드 대문자 export (GET, POST, PUT, DELETE, PATCH)
- 성공: `{ data: T }`, 에러: `{ error: string }` 형식
- try-catch 에러 핸들링
- 동적 라우트 params Promise 처리

---

### `/code:socket` — Socket.io 핸들러 + 클라이언트 훅

```
/code:socket chat message,typing,read
```

**생성 파일:** `types/socket.ts` + `hooks/use-{name}-socket.ts`

**자동으로 적용되는 것:**

- ServerToClientEvents / ClientToServerEvents 타입 정의
- Socket 싱글톤 관리
- cleanup 시 disconnect

---

### `/code:feature` — Feature 모듈 생성

```
/code:feature cart
```

**생성 구조:**

```
src/features/cart/
├── components/     # feature 전용 컴포넌트
├── hooks/          # feature 전용 훅
├── types/          # feature 전용 타입
├── utils/          # feature 전용 유틸리티
└── index.ts        # public exports
```

---

### `/code:story` — Storybook 스토리 생성

```
/code:story Button
/code:story src/components/common/user-profile.tsx
```

**생성 위치:** `src/stories/` 하위에 컴포넌트 폴더 구조를 미러링

```
src/components/common/button/button.tsx   → src/stories/common/button/button.stories.tsx
src/components/ui/dialog.tsx              → src/stories/ui/dialog.stories.tsx
```

**자동으로 적용되는 것:**

- CSF3 형식
- variants별 스토리 생성
- 바꿀 수 있는 값은 args로 노출

---

### `/code:test` — 테스트 생성

```
/code:test src/components/common/button/arrow-buttons.tsx
/code:test src/lib/utils.ts
```

**생성 위치:** 대상 파일과 같은 디렉토리 (`{파일명}.test.tsx`)

**자동으로 적용되는 것:**

- `docs/testing.md` 규칙 참조
- Vitest + React Testing Library + happy-dom
- 접근성 쿼리 우선 (`getByRole`, `getByLabelText`)
- `userEvent` 사용 (`fireEvent` 대신)
- 한국어 테스트 설명 (`describe`/`it`)
- `padding-line-between-statements` 준수 (문 사이 빈 줄)

**테스트 범위:**

- 렌더링, 사용자 인터랙션, Props 변화, 조건부 렌더링, 접근성

---

## 5. 슬래시 명령어 — 개발 도구

### `/dev:validate` — 전체 검증

```
/dev:validate
/dev:validate --fix    # 자동 수정 포함
```

`pnpm validate` (type-check + lint + knip)를 실행하고 결과를 분석합니다.

---

### `/dev:review` — 코드 리뷰

```
/review                                          # 현재 git diff 리뷰
/review src/components/common/quick-menu.tsx     # 특정 파일 리뷰
```

프로젝트 컨벤션 기준으로 코드를 리뷰합니다.

**체크 항목:**

| 카테고리    | 검사 내용                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| 코드 스타일 | 화살표 함수, named export (Next.js 규약 파일은 `export default function` 허용), kebab-case, curly, eqeqeq |
| TypeScript  | any 미사용, interface 우선, inline type import, non-null assertion                                        |
| React       | React 19 패턴, JSX falsy 누출, self-closing, hooks 규칙                                                   |
| 컴포넌트    | 파일당 하나, CVA+cn(), 공통 컴포넌트 재사용, @doubltworks 확인                                            |
| Import      | 중복/순환/자기참조 없음, import 후 빈 줄                                                                  |

**출력 예시:**

```
## 리뷰 결과: quick-menu.tsx

### 통과 ✅
- 화살표 함수 기본 사용 (Next.js 규약 파일은 `export default function` 허용)
- named export 기본 사용 (Next.js 규약 파일·Storybook meta는 `export default` 허용)

### 위반 ❌
- [TypeScript] L23: any 타입 사용 → unknown + 타입 가드로 변경
- [React] L45: {items.length && ...} → {items.length > 0 && ...}

### 제안 💡
- L30: @/components/ui/button에 동일한 컴포넌트가 있음, 재사용 고려
```

**추천 사용 시점:** PR 올리기 전 셀프 리뷰

---

### `/dev:refactor` — 리팩터링

```
/refactor src/components/calendar/calendar.tsx
```

기존 코드를 현재 컨벤션에 맞게 리팩터링합니다.

**4단계 프로세스:**

```
① 분석      대상 파일 읽기 + 사용처 Grep 검색
② 예고      리팩터링 계획 + 예상 사이드이펙트 보고 (수정 전)
③ 수정      사용자 승인 후 코드 수정 (사용처 import도 함께)
④ 검증      pnpm lint:fix && pnpm format → 에러 시 반복
```

**리팩터링 항목:**

| 카테고리    | 변환 내용                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| 코드 스타일 | `function` → 화살표 (Next.js 규약 파일 제외), `export default` → named (Next.js 규약 파일 제외), `var` → const |
| TypeScript  | `any` → unknown, `type` → interface, `\|\|` → `??`                                                             |
| React 19    | `forwardRef` → ref props, `useContext` → `use` hook                                                            |
| 컴포넌트    | 인라인 스타일 → CVA+cn(), 파일 분리                                                                            |

**주의:** 리팩터링은 동작을 변경하지 않습니다. 기능은 동일, 코드만 개선.

---

## 6. 슬래시 명령어 — Git

### `/git:commit` — 커밋 생성

```
/git:commit
```

변경사항을 분석하고 `[level] 설명` 형식으로 커밋합니다.

- 스테이징되지 않은 파일이 있으면 확인 후 추가
- Co-Authored-By 줄 추가 금지

---

### `/git:push` — 안전한 푸시

```
/git:push
```

- main/develop 브랜치 직접 푸시 시 경고
- force push 금지

---

### `/git:pr` — PR 생성

```
/git:pr
```

- develop 브랜치 기준으로 모든 커밋 분석
- `.claude/pr-rules.md` + `.github/pull_request_template.md` 템플릿 준수
- Why 중심 작성, `gh pr create` 자동 실행

---

## 7. 자동 학습 시스템

Claude는 작업 중 발견한 프로젝트 지식을 `.claude/memory/`에 자동 기록합니다.

### 기록 카테고리

| 파일              | 기록 시점                  | 예시                      |
| ----------------- | -------------------------- | ------------------------- |
| `_index.md`       | 중요 사항 발견 시          | 핵심 요약                 |
| `patterns.md`     | 프로젝트 특화 패턴 발견 시 | CVA 사용 패턴             |
| `pitfalls.md`     | 실수 발생 + 해결 시        | GitHub Packages 인증 오류 |
| `decisions.md`    | 기술적 선택 이유가 있을 때 | 특정 라이브러리 선택 이유 |
| `dependencies.md` | 의존성 이슈 발견 시        | @doubltworks/tokens 설정  |

### 팀 공유 흐름

```
Claude 작업 → memory/ 기록 → Git 커밋 → 팀 공유 → 모든 팀원의 Claude가 참조
```

---

## 8. 팀 협업 가이드

### 새 팀원 온보딩

1. Claude Code 설치
2. 프로젝트 클론
3. `CLAUDE.md`가 자동으로 로드됨 → Claude가 프로젝트 컨텍스트 파악
4. 슬래시 명령어 사용 시작

### 베스트 프랙티스

**DO:**

- 슬래시 명령어 적극 활용 (팀 전체 일관성 유지)
- Claude가 기록한 memory 내용 리뷰 후 커밋
- PR 전 `/review`로 셀프 리뷰
- 새로운 패턴/실수 발견 시 Claude에게 기록 요청

**DON'T:**

- memory 파일 직접 수정 (Claude가 관리)
- CLAUDE.md 임의 변경 (팀 논의 후 수정)
- 슬래시 명령어 무시하고 수동 작업 (컨벤션 깨짐)

### 일반 대화 vs 슬래시 명령어

| 상황            | 추천 방식                         |
| --------------- | --------------------------------- |
| 컴포넌트 만들기 | `/code:component Button`          |
| 버그 수정       | 일반 대화 ("이 버그 수정해줘")    |
| 테스트 추가     | `/code:test src/path/to/file.tsx` |
| 코드 리뷰       | `/review`                         |
| 리팩터링        | `/refactor src/path/to/file.tsx`  |
| 커밋            | `/git:commit`                     |
| 질문/상담       | 일반 대화                         |

---

## 9. 유지보수

### 파일별 역할과 수정 주체

| 파일                         | 역할                  | 수정 주체     | 수정 시 주의                            |
| ---------------------------- | --------------------- | ------------- | --------------------------------------- |
| `CLAUDE.md`                  | 핵심 규칙 (매번 로드) | 팀 논의 후    | 줄 수 증가 = 매 대화 컨텍스트 비용 증가 |
| `docs/coding-conventions.md` | 전체 컨벤션 + 예시    | 팀 논의 후    | CLAUDE.md에도 반영 필요                 |
| `docs/testing.md`            | 테스트 가이드         | 팀 논의 후    | /code:test 명령어와 동기화              |
| `.claude/commands/**`        | 슬래시 명령어         | 팀 논의 후    | 호출 시에만 로드 (비용 적음)            |
| `.claude/memory/**`          | 자동 학습             | Claude (자동) | 수동 수정 지양                          |
| `.claude/pr-rules.md`        | PR 규칙               | 팀 논의 후    | /git:pr 명령어가 참조                   |

### 새 슬래시 명령어 추가 방법

1. `.claude/commands/{category}/{name}.md` 파일 생성
2. 상단에 conventions 참조 지시 추가: `> 코드 생성 전 docs/coding-conventions.md를 Read 도구로 읽고 전체 규칙을 확인한다.`
3. 사용법, 규칙, 템플릿 작성
4. `CLAUDE.md`의 Slash Commands 섹션 업데이트
5. 이 가이드 문서도 업데이트
6. PR 후 팀 공유

### 컨벤션 변경 시 동기화 체크리스트

컨벤션이 변경되면 다음 파일들을 함께 업데이트해야 합니다:

```
docs/coding-conventions.md   ← 원본 (상세 규칙 + 코드 예시)
         ↓ 반영
CLAUDE.md                    ← 핵심 규칙 요약 (예시 없이)
         ↓ 반영
.claude/commands/code/*.md   ← 관련 명령어의 템플릿/규칙
```

---

## 부록: 전체 명령어 요약

| 명령어            | 카테고리  | 한 줄 설명                    |
| ----------------- | --------- | ----------------------------- |
| `/code:component` | 코드 생성 | CVA 패턴 컴포넌트 생성        |
| `/code:hook`      | 코드 생성 | 커스텀 훅 생성                |
| `/code:page`      | 코드 생성 | Next.js 페이지 스캐폴딩       |
| `/code:api`       | 코드 생성 | API Route 핸들러 생성         |
| `/code:socket`    | 코드 생성 | Socket.io 핸들러 + 훅 생성    |
| `/code:feature`   | 코드 생성 | Feature 모듈 구조 생성        |
| `/code:story`     | 코드 생성 | Storybook 스토리 생성         |
| `/code:test`      | 코드 생성 | Vitest + RTL 테스트 생성      |
| `/dev:validate`   | 개발 도구 | 전체 검증 (tsc + lint + knip) |
| `/dev:review`     | 개발 도구 | 컨벤션 기준 코드 리뷰         |
| `/dev:refactor`   | 개발 도구 | 컨벤션 맞춤 리팩터링          |
| `/git:commit`     | Git       | 컨벤션 맞춤 커밋 생성         |
| `/git:push`       | Git       | 안전한 푸시                   |
| `/git:pr`         | Git       | PR 생성 (템플릿 자동 적용)    |
