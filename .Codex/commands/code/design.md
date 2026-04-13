---
description: 'AI 주도 UI 설계 및 구현'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /code:design — AI 주도 UI 설계 + 구현

디자이너 없는 환경에서 설명 기반으로 UI를 설계하고 구현한다.

## 사용법

```
/code:design 게임 목록 페이지 - 카드 그리드, 장르 필터, 검색바
/code:design 프로필 페이지 - 경험치 바, 플레이 이력
/code:design 랭킹 페이지 - 게임별 랭킹, 탭 전환
```

## 절차

### 1. 사전 조사

1. `docs/design-system.md`를 Read로 읽는다
2. `docs/ui-patterns.md`를 Read로 읽는다
3. `docs/coding-conventions.md`를 Read로 읽는다

### 2. 가용 컴포넌트 확인

```bash
ls src/components/ui/
```

필요한 shadcn/ui 컴포넌트가 없으면 설치 명령 안내.

### 3. 참고 사이트 조사 (선택)

유사한 UI가 필요하면 WebSearch로 참고 사이트 확인:

- itch.io, CrazyGames, Poki 등 게임 플랫폼
- 유사한 레이아웃을 가진 웹사이트

### 4. 와이어프레임 제시

ASCII 와이어프레임으로 레이아웃 설계 → 사용자 승인 요청.

```
## UI 설계: {페이지명}

### 와이어프레임
(ASCII 레이아웃)

### 사용 컴포넌트
- shadcn/ui: Card, Button, Badge, ...
- 커스텀: GameCard, ...

### 반응형 전략
- 모바일 (< 640px): ...
- 태블릿 (768px~): ...
- 데스크톱 (1024px~): ...

이 설계로 진행할까요?
```

### 5. 구현

승인 후:

- CVA + cn() 패턴
- design-system.md 토큰 사용
- 반응형 (모바일 퍼스트)
- 다크모드 대응
- 로딩 상태 (스켈레톤)
- 빈 상태
- 에러 상태

### 6. Storybook 스토리 생성

공통 컴포넌트는 Storybook 스토리 포함.

### 7. 검증

```bash
pnpm lint:fix && pnpm format
```

## 디자인 원칙

1. **비주얼 중심** — 게임 플랫폼답게 썸네일/이미지 강조
2. **일관성** — design-system.md 토큰 일관 사용
3. **반응형** — 모바일 퍼스트, 최소 3단계
4. **접근성** — alt 텍스트, 키보드 네비게이션, 색상 대비
5. **shadcn/ui 우선** — 직접 만들기 전에 기존 컴포넌트 확인

## 인수: $ARGUMENTS
