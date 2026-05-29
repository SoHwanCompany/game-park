---
description: '게임 관련 페이지/컴포넌트 스캐폴딩'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# /code:game — 게임 관련 페이지/컴포넌트 스캐폴딩

사용자가 요청한 게임 관련 컴포넌트를 생성한다.

## 사용법

```
/code:game play      # 게임 플레이 페이지 (iframe + postMessage)
/code:game detail    # 게임 상세 페이지
/code:game list      # 게임 목록 (장르 필터, 검색)
/code:game card      # 게임 카드 컴포넌트
/code:game ranking   # 랭킹 테이블
/code:game like      # 좋아요 버튼 (낙관적 업데이트)
```

## 절차

1. `docs/game-integration.md`를 Read로 읽는다
2. `docs/design-system.md`를 Read로 읽는다
3. `docs/coding-conventions.md`를 Read로 읽는다
4. 기존 관련 코드를 확인한다
5. 요청된 컴포넌트/페이지를 생성한다
6. `pnpm lint:fix && pnpm format` 실행

## 타입별 생성 가이드

### play — 게임 플레이 페이지

- 경로: `src/app/(fullscreen)/play/[id]/page.tsx`
- iframe + postMessage 프로토콜 구현
- 게임 생명주기 관리 (INIT, PAUSE, RESUME, TERMINATE)
- 결과 모달 (GAME_OVER 시)
- `game-integrator` 에이전트의 체크리스트 준수

### detail — 게임 상세 페이지

- 경로: `src/app/(main)/games/[id]/page.tsx`
- 썸네일, 게임 정보, 좋아요, 플레이 버튼
- 랭킹 테이블 (해당 게임)
- `docs/ui-patterns.md`의 게임 상세 패턴 참조

### list — 게임 목록 페이지

- 경로: `src/app/(main)/games/page.tsx`
- 게임 카드 그리드
- 장르 필터 (탭/칩)
- 검색바 (debounce 300ms)
- 정렬 (인기순, 최신순, 좋아요순)

### card — 게임 카드 컴포넌트

- 경로: `src/components/common/game-card.tsx`
- shadcn Card 기반, CVA + cn() 패턴
- 썸네일 (aspect-video), 이름, 장르 뱃지, 좋아요 수
- 호버 효과, 클릭 → 게임 상세 이동

### ranking — 랭킹 테이블 컴포넌트

- 경로: `src/components/common/ranking-table.tsx`
- shadcn Table 기반
- 1-3위 시각적 강조
- 본인 순위 하이라이트

### like — 좋아요 버튼

- 경로: `src/components/interaction/like-button.tsx`
- 낙관적 업데이트 패턴
- 로그인 필요 시 로그인 유도
- 하트 아이콘 애니메이션

## 인수: $ARGUMENTS
