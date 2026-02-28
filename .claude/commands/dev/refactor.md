# /refactor - 리팩터링

> 리팩터링 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

기존 코드를 현재 프로젝트 컨벤션에 맞게 리팩터링합니다.

## 사용법

```
/refactor src/components/calendar/calendar.tsx
/refactor src/components/ui/input.tsx
```

## 실행 순서

### 1단계: 분석

1. 대상 파일을 Read 도구로 읽는다
2. **사용처 확인** — 대상 컴포넌트/함수를 사용하는 모든 파일을 Grep으로 검색
3. 사용처 목록을 보고한다

### 2단계: 사이드이펙트 예고

리팩터링 계획과 예상 사이드이펙트를 **코드 수정 전에** 보고한다:

```
## 리팩터링 계획: {파일명}

### 변경 사항
1. `function` → 화살표 함수 변환 (Next.js 규약 파일 제외)
2. `export default` → named export 변환 (Next.js 규약 파일·Storybook meta 제외)
3. ...

### 사용처 (N개 파일)
- src/app/page.tsx: L12에서 import
- src/stories/ui/button.stories.tsx: L5에서 import

### 예상 사이드이펙트
- named export 변환 시 사용처 N개의 import 구문 수정 필요 (Next.js 규약 파일은 default export 유지)
- ...
```

### 3단계: 사용자 승인 후 수정

사용자가 승인하면 코드를 수정한다. **사용처의 import도 함께 수정한다.**

### 4단계: 검증

수정 후 `pnpm lint:fix && pnpm format`을 실행하고, 에러가 있으면 수정 후 재실행한다.

## 리팩터링 항목

### 코드 스타일

- `function` → `const` + 화살표 함수 (Next.js 규약 파일 제외)
- `export default` → named export (Next.js 규약 파일·Storybook meta 제외)
- `var` → `const`/`let`
- 문자열 연결 → 템플릿 리터럴
- `==`/`!=` → `===`/`!==`

### TypeScript

- `any` → `unknown` + 타입 가드
- `type` (객체) → `interface`
- 일반 import → inline type import
- `||` → `??`, `&&` 체이닝 → `?.`
- non-null assertion(`!`) 제거

### React 19 마이그레이션

- `forwardRef` → ref props 직접 사용
- `useContext` → `use` hook
- `propTypes` → TypeScript 타입 제거

### 컴포넌트

- 인라인 스타일/클래스 → CVA + cn() 패턴
- 복수 컴포넌트 파일 → 파일 분리 (ui/\*\* 제외)
- 공통 컴포넌트 활용 가능 여부 확인

## 주의사항

- 리팩터링은 **동작을 변경하지 않는다** — 기능은 동일, 코드만 개선
- 사용처가 많은 컴포넌트일수록 사이드이펙트 분석을 철저히 한다
- 한 번에 너무 많은 변경을 하지 않는다 — 파일 단위로 진행
