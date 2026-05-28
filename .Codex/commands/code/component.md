# /component - 컴포넌트 생성

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

프로젝트 컨벤션에 맞는 새 컴포넌트를 생성합니다.

## 사용법

```
/component Button
/component UserProfile --common
/component CartItem --feature=cart
```

## 옵션

- `--common`: `src/components/common/`에 생성 (기본)
- `--ui`: `src/components/ui/`에 생성 (shadcn 스타일)
- `--feature=<name>`: `src/features/<name>/components/`에 생성

## 생성 규칙

1. 파일명: kebab-case (`user-profile.tsx`)
2. 컴포넌트명: PascalCase (`UserProfile`)
3. named export 기본 사용 (`export const`). Next.js 규약 파일은 `export default function` 허용
4. arrow function 기본 사용. Next.js 규약 파일은 `function` 키워드 허용
5. CVA로 variants 정의
6. cn() 유틸리티로 className 병합
7. https://nextjs.org/docs 넥스트 js docs전체 보고 공식 문서대로 구조 잡기.
8. use client 와 use server을 제대로 사용하기.
9. 최대한 use server을 사용하고 동적인 것만 use client사용하기.
10. 아토믹 디자인 패턴
11. shadcn ui에서 제공한 코드 제외하고는 한 파일 안에서 여러 컴포넌트 정의는 하지 말 것.
12. 쓸데없는 주석은 작성하지 말 것.

## 템플릿

```tsx
import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: '',
    },
    size: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof componentVariants> {}

export const Component = ({ className, variant, size, ...props }: ComponentProps) => {
  return <div className={cn(componentVariants({ variant, size }), className)} {...props} />;
};
```

## 컴포넌트 사용 규칙

1. 다른 컴포넌트에서 사용하고 있을 경우 어떤 컴포넌트에서 어떻게 사용되고 있는지 말해줄 것.
2. 현재 코드 수정 시, 사이드이펙트가 생길 가능성이 있다면 어떤 사이드 이펙트가 어떻게 생길것 같은지 예상 결과를 말하고 코드 수정 전 미리 말할 것.
3. 현재 프로젝트의 공통컴포넌트(@src/components 하위 폴더를 의미)를 사용할 수 있는지 체크하기
4. @doubltworks/ 패키지의 하위 폴더 공통 컴포넌트를 사용할 수 있는지 체크하기
