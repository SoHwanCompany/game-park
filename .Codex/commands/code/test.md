# /code:test - 테스트 생성

> 테스트 생성 전 `docs/testing.md`와 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

대상 파일에 대한 Vitest + React Testing Library 테스트를 생성합니다.

## 사용법

```
/code:test src/components/common/button/arrow-buttons.tsx
/code:test src/lib/utils.ts
/code:test src/hooks/use-mobile.ts
```

## 생성 위치

- 테스트 파일은 대상 파일과 **같은 디렉토리**에 위치
- 파일명: `{대상 파일명}.test.ts` 또는 `{대상 파일명}.test.tsx`

```
src/components/common/button/arrow-buttons.tsx
→ src/components/common/button/arrow-buttons.test.tsx

src/lib/utils.ts
→ src/lib/utils.test.ts
```

## 테스트 작성 원칙

1. **사용자 관점에서 테스트** — 구현 디테일이 아닌 사용자가 보는 것을 테스트
2. **접근성 쿼리 우선** — `getByRole`, `getByLabelText` 사용 (id/class 기반 쿼리 지양)
3. **`userEvent` 사용** — `fireEvent` 대신 `userEvent`로 실제 인터랙션 시뮬레이션
4. **한국어 테스트 설명** — `describe`/`it` 설명을 한국어로 작성
5. **padding-line-between-statements** — 변수 선언, `render()`, `expect()` 사이에 빈 줄 필수

## 컴포넌트 테스트 템플릿

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Component } from './component';

describe('Component', () => {
  it('렌더링된다', () => {
    render(<Component />);

    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('클릭 이벤트를 처리한다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Component onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## 유틸리티 테스트 템플릿

```ts
import { utilFunction } from './util';

describe('utilFunction', () => {
  it('정상 입력을 처리한다', () => {
    const result = utilFunction('input');

    expect(result).toBe('expected');
  });

  it('엣지 케이스를 처리한다', () => {
    const result = utilFunction('');

    expect(result).toBe('fallback');
  });
});
```

## 테스트 범위

- **렌더링** — 컴포넌트가 정상적으로 렌더링되는지
- **사용자 인터랙션** — 클릭, 입력, 호버 등
- **Props 변화** — variant, size, disabled 등 props별 동작
- **조건부 렌더링** — 특정 조건에서 요소가 표시/숨김되는지
- **접근성** — role, aria 속성이 올바른지

## 실행 후

```bash
pnpm test                    # 전체 테스트
pnpm test {파일경로}          # 단일 파일 테스트
```
