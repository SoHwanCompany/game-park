# Design System

디자이너 없이 일관된 UI를 생성하기 위한 디자인 시스템 가이드.

## 컬러 팔레트

CSS 변수 기반. `src/app/globals.css`의 `:root` 및 `.dark` 참조.

### 시맨틱 토큰

| 토큰                                 | 용도               |
| ------------------------------------ | ------------------ |
| `--background`                       | 페이지 배경        |
| `--foreground`                       | 기본 텍스트        |
| `--card` / `--card-foreground`       | 카드 배경/텍스트   |
| `--primary` / `--primary-foreground` | 주요 액션 (CTA)    |
| `--secondary`                        | 보조 요소          |
| `--muted` / `--muted-foreground`     | 비활성/보조 텍스트 |
| `--accent`                           | 강조 (호버 등)     |
| `--destructive`                      | 삭제/위험 액션     |
| `--border`                           | 테두리             |
| `--ring`                             | 포커스 링          |

### 게임 플랫폼 특화 색상

게임 플랫폼 특성에 맞는 추가 토큰 (필요 시 globals.css에 추가):

```css
:root {
  --game-primary: var(--primary); /* 게임 카드 강조 */
  --game-success: oklch(0.72 0.19 145); /* 점수/성공 */
  --game-warning: oklch(0.75 0.18 75); /* 경고 */
  --game-info: oklch(0.7 0.15 240); /* 정보 */
}
```

## 타이포그래피

Tailwind CSS 유틸리티 기반.

| 용도        | 클래스                                                |
| ----------- | ----------------------------------------------------- |
| 페이지 제목 | `text-3xl font-bold` (모바일) / `text-4xl` (데스크톱) |
| 섹션 제목   | `text-2xl font-semibold`                              |
| 카드 제목   | `text-lg font-semibold`                               |
| 본문        | `text-base`                                           |
| 보조 텍스트 | `text-sm text-muted-foreground`                       |
| 캡션/라벨   | `text-xs text-muted-foreground`                       |

## 간격 (Spacing)

Tailwind 기본 스케일 사용. 일관성을 위한 권장 값:

| 용도             | 값                                  |
| ---------------- | ----------------------------------- |
| 페이지 패딩      | `px-4` (모바일) / `px-6` (데스크톱) |
| 섹션 간격        | `py-8` ~ `py-12`                    |
| 카드 내부 패딩   | `p-4` ~ `p-6`                       |
| 요소 간 간격     | `gap-4` ~ `gap-6`                   |
| 인라인 요소 간격 | `gap-2`                             |

## 컨테이너

```tsx
// 페이지 최대 너비
<div className="mx-auto max-w-7xl px-4 md:px-6">

// 좁은 컨테이너 (폼, 상세 등)
<div className="mx-auto max-w-3xl px-4">
```

## 컴포넌트 사용 패턴

### 버튼

shadcn/ui `Button` 컴포넌트 사용. 직접 `<button>` 만들지 않는다.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">주요 액션</Button>
<Button variant="secondary">보조 액션</Button>
<Button variant="outline">테두리</Button>
<Button variant="ghost">고스트</Button>
<Button variant="destructive">삭제</Button>
```

### 카드

게임 카드는 `Card` 컴포넌트 기반.

```tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card className="overflow-hidden transition-shadow hover:shadow-lg">
  <div className="relative aspect-video">
    <img src={thumbnail} alt={gameName} className="object-cover" />
  </div>
  <CardHeader>
    <CardTitle className="text-lg">{gameName}</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground text-sm">{description}</p>
  </CardContent>
  <CardFooter className="justify-between">
    <Badge>{genreName}</Badge>
    <span className="text-muted-foreground text-sm">♥ {likeCount}</span>
  </CardFooter>
</Card>;
```

### 입력 필드

shadcn/ui `Input`, `Label` 사용. React Hook Form + Zod 연동.

### 테이블

랭킹 등에는 shadcn/ui `Table` 컴포넌트 사용.

### 뱃지

장르 태그 등에 `Badge` 컴포넌트 사용.

## 게임 플랫폼 특화 패턴

### 썸네일 강조

게임 플랫폼은 비주얼 중심. 썸네일은 항상 `aspect-video`로 비율 고정.

```tsx
<div className="relative aspect-video overflow-hidden rounded-lg">
  <img src={thumbnail} alt={gameName} className="h-full w-full object-cover" />
</div>
```

### 로딩 상태

스켈레톤 UI 사용:

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Card>
  <Skeleton className="aspect-video w-full" />
  <CardHeader>
    <Skeleton className="h-5 w-3/4" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-4 w-full" />
  </CardContent>
</Card>;
```

### 빈 상태

데이터가 없을 때의 빈 상태 표시:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <p className="text-lg font-medium">게임이 없습니다</p>
  <p className="text-muted-foreground mt-2 text-sm">나중에 다시 확인해 주세요</p>
</div>
```

## 반응형 브레이크포인트

Tailwind 기본 브레이크포인트 사용:

| 접두사 | 최소 너비 | 용도          |
| ------ | --------- | ------------- |
| `sm`   | 640px     | 큰 모바일     |
| `md`   | 768px     | 태블릿        |
| `lg`   | 1024px    | 데스크톱      |
| `xl`   | 1280px    | 넓은 데스크톱 |

### 게임 카드 그리드

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {games.map((game) => (
    <GameCard key={game.id} game={game} />
  ))}
</div>
```

## 다크모드

shadcn/ui의 `ThemeProvider` 사용. CSS 변수가 `:root`와 `.dark`에 정의되어 자동 전환.

다크모드 고려사항:

- `bg-white` 대신 `bg-background` 사용
- `text-black` 대신 `text-foreground` 사용
- 하드코딩된 색상 사용 금지, 항상 시맨틱 토큰 사용

## 참고 사이트

UI 설계 시 아래 유사 플랫폼을 참고한다:

- **itch.io** — 인디 게임 플랫폼, 카드 레이아웃
- **CrazyGames** — 브라우저 게임 플랫폼, 카테고리 필터
- **게임 허브 사이트** — 게임 목록/상세/플레이 UI 패턴
