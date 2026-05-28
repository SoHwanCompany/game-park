# /figma - Figma 디자인 → 반응형 컴포넌트 생성

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

Figma 디자인 URL을 받아 반응형 컴포넌트를 생성합니다.

## 사용법

```
/figma ComponentName --feature=<name>
URL_1920: <figma-url>
URL_1024: <figma-url>
URL_768: <figma-url>
URL_360: <figma-url>
```

사용자가 위 형식으로 입력하지 않아도, 대화에서 컴포넌트 이름·옵션·URL을 파악한다.
URL은 1~4개까지 가능하며, 누락된 브레이크포인트는 가장 가까운 크기의 디자인을 따른다.

## 옵션

- `--common`: `src/components/common/`에 생성 (기본)
- `--ui`: `src/components/ui/`에 생성 (shadcn 스타일)
- `--feature=<name>`: `src/features/<name>/components/`에 생성

## 브레이크포인트 매핑

| Figma 프레임 | Tailwind 접두사 | 설명                  |
| ------------ | --------------- | --------------------- |
| 1920px       | `2xl:`          | 와이드 데스크톱       |
| 1024px       | `lg:`           | 데스크톱/태블릿 가로  |
| 768px        | `md:`           | 태블릿 세로           |
| 360px        | (base)          | 모바일 (mobile-first) |

## 실행 절차

### 1단계: Figma 디자인 분석

각 URL에 대해 `mcp__figma__get_design_context`를 호출하여 디자인 정보를 가져온다.

- 가능하면 모든 URL을 **병렬로** 호출한다
- URL에서 `fileKey`와 `nodeId`를 추출한다
  - URL 형식: `https://figma.com/design/:fileKey/:fileName?node-id=:nodeId`
  - `node-id` 파라미터의 `-`를 `:`로 변환 (예: `1-2` → `1:2`)

### 2단계: 디자인 비교·분석

4개(또는 그 이하) 브레이크포인트의 디자인을 비교하여:

- **공통 요소**: 모든 브레이크포인트에서 동일한 구조·스타일
- **변경 요소**: 브레이크포인트별로 달라지는 레이아웃·크기·표시 여부
- **숨김 요소**: 특정 브레이크포인트에서만 보이거나 숨겨지는 요소

### 3단계: 컴포넌트 생성

`/component` 커맨드의 생성 규칙을 따르되, 추가로:

1. **Mobile-first 접근**: base 스타일은 360px 디자인 기준
2. **반응형 클래스**: Tailwind 접두사로 브레이크포인트별 스타일 적용
3. **레이아웃 변경**: `flex-col md:flex-row` 등 방향 전환
4. **크기 변경**: `text-sm md:text-base lg:text-lg` 등 크기 조절
5. **표시 전환**: `hidden md:block` / `md:hidden` 등 요소 표시/숨김
6. **Grid 변경**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` 등

### 4단계: 이미지 에셋 처리

Figma에서 반환된 에셋 다운로드 URL이 있으면:

- 사용자에게 에셋 목록과 다운로드 URL을 알려준다
- 코드에서는 에셋 경로를 placeholder로 남긴다 (`@assets/` 경로)

### 5단계: Storybook 스토리 생성

`/story` 커맨드의 규칙을 따라 스토리를 자동 생성한다.

- 스토리 위치: `src/stories/`에 컴포넌트 경로를 미러링
  ```
  src/components/common/card/card.tsx → src/stories/common/card/card.stories.tsx
  src/features/cart/components/cart-item.tsx → src/stories/features/cart/cart-item.stories.tsx
  ```
- CSF3 형식, `satisfies Meta<typeof Component>` 사용
- CVA variants가 있으면 `argTypes`에 `control: 'select'`로 추가
- **반응형 확인용 스토리 포함**:
  - `parameters.viewport`를 활용하여 브레이크포인트별 스토리 또는 viewport 설정 추가
  - 예: `Default`, `Mobile`, `Tablet`, `Desktop` 스토리

### 6단계: 검증

- `pnpm lint:fix && pnpm format` 실행
- 에러 수정 후 반복

## 생성 규칙

`/component` 커맨드의 모든 규칙을 따른다:

- 파일명: kebab-case
- 컴포넌트명: PascalCase
- named export 기본 사용 (Next.js 규약 파일은 `export default function` 허용)
- arrow function 기본 사용 (Next.js 규약 파일은 `function` 키워드 허용)
- CVA + cn() 패턴
- 한 파일 하나 컴포넌트
- 쓸데없는 주석 금지

## 예시 출력

```tsx
import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-lg border bg-card p-4 md:p-6 lg:p-8', {
  variants: {
    variant: {
      default: '',
      outlined: 'border-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  title: string;
  description?: string;
}

export const Card = ({ className, variant, title, description, ...props }: CardProps) => {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {/* 모바일: 세로 / 태블릿 이상: 가로 */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4">
        <h3 className="text-base font-semibold md:text-lg lg:text-xl 2xl:text-2xl">{title}</h3>

        {description != null && (
          <p className="text-muted-foreground mt-1 text-sm md:mt-0 md:text-base">{description}</p>
        )}
      </div>
    </div>
  );
};
```
