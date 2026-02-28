# /story - Storybook 스토리 생성

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

컴포넌트에 대한 Storybook 스토리를 생성합니다.

## 사용법

```
/story Button
/story src/components/common/user-profile.tsx
```

## 생성 위치

- `src/stories/` 하위에 컴포넌트의 폴더 구조를 그대로 미러링한다.

```
컴포넌트 경로                              → 스토리 경로
src/components/common/button/button.tsx   → src/stories/common/button/button.stories.tsx
src/components/ui/dialog.tsx              → src/stories/ui/dialog.stories.tsx
src/components/form/input-field.tsx       → src/stories/form/input-field.stories.tsx
src/features/cart/components/cart-item.tsx → src/stories/features/cart/cart-item.stories.tsx
```

## 생성 규칙

1. 파일명: kebab-case (`button.stories.tsx`)
2. 컴포넌트 import 후 variants별 스토리 생성
3. CSF3 형식 사용
4. option과 같은 바꿀 수 있는 값은 무조건 args로 넘겨서 스토리북에서 확인할 수 있도록 하기. (예시, variant가 여러개일 경우 option 스토리북에서 제공해야됨.)

## 템플릿

```tsx
import { Component } from '@components/common/component';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Component',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default'],
    },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Component',
  },
};
```

## 실행 후

스토리 확인: `pnpm storybook`
