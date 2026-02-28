# Game Integration Guide

게임 플랫폼과 iframe 게임 간의 통합 프로토콜 정의.

## 아키텍처

```
[게임 React 레포] → S3 업로드 → CloudFront CDN → iframe으로 플랫폼에 로드
```

- 게임은 별도 React 레포에서 개발
- 빌드 결과물을 S3에 업로드
- CloudFront CDN을 통해 서빙
- 플랫폼에서 iframe으로 로드하여 표시

## URL 패턴

```
게임 URL: https://{CLOUDFRONT_DOMAIN}/{gameCode}/index.html
환경변수: NEXT_PUBLIC_GAME_CDN_URL (CloudFront 도메인)
```

절대 S3 URL을 직접 하드코딩하지 않는다. 반드시 환경변수를 사용한다.

```typescript
// Good
const gameUrl = `${process.env.NEXT_PUBLIC_GAME_CDN_URL}/${gameCode}/index.html`;

// Bad — 절대 하드코딩 금지
const gameUrl = 'https://d1234.cloudfront.net/tetris/index.html';
```

## iframe 설정

```tsx
<iframe
  src={gameUrl}
  sandbox="allow-scripts allow-same-origin"
  allow="autoplay; fullscreen"
  className="h-full w-full border-0"
  title={gameName}
/>
```

### sandbox 속성

| 속성                | 설명                 |
| ------------------- | -------------------- |
| `allow-scripts`     | JavaScript 실행 허용 |
| `allow-same-origin` | 동일 출처 정책 유지  |

`allow-forms`, `allow-popups`는 게임에서 필요한 경우에만 추가한다.

## postMessage 프로토콜

### Platform → Game

| 메시지      | 설명             | payload                        |
| ----------- | ---------------- | ------------------------------ |
| `INIT`      | 게임 초기화 요청 | `{ userId, nickname, gameId }` |
| `PAUSE`     | 게임 일시정지    | `{}`                           |
| `RESUME`    | 게임 재개        | `{}`                           |
| `TERMINATE` | 게임 종료        | `{}`                           |

```typescript
// Platform에서 Game으로 메시지 전송
iframe.contentWindow?.postMessage(
  { type: 'INIT', payload: { userId, nickname, gameId } },
  process.env.NEXT_PUBLIC_GAME_CDN_URL,
);
```

### Game → Platform

| 메시지      | 설명           | payload               |
| ----------- | -------------- | --------------------- |
| `READY`     | 게임 로드 완료 | `{}`                  |
| `SCORE`     | 중간 점수 보고 | `{ score }`           |
| `GAME_OVER` | 게임 종료      | `{ score, playtime }` |
| `ERROR`     | 에러 발생      | `{ code, message }`   |

```typescript
// Platform에서 Game 메시지 수신
window.addEventListener('message', (event) => {
  // origin 검증 필수
  if (event.origin !== process.env.NEXT_PUBLIC_GAME_CDN_URL) {
    return;
  }

  const { type, payload } = event.data;

  switch (type) {
    case 'READY':
      // 게임 초기화 메시지 전송
      break;
    case 'SCORE':
      // 점수 업데이트
      break;
    case 'GAME_OVER':
      // 게임 종료 처리, 랭킹 제출
      break;
    case 'ERROR':
      // 에러 표시
      break;
  }
});
```

## 메시지 스키마 (Zod)

```typescript
import { z } from 'zod';

const gameMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('READY'), payload: z.object({}) }),
  z.object({ type: z.literal('SCORE'), payload: z.object({ score: z.number() }) }),
  z.object({
    type: z.literal('GAME_OVER'),
    payload: z.object({ score: z.number(), playtime: z.number() }),
  }),
  z.object({
    type: z.literal('ERROR'),
    payload: z.object({ code: z.string(), message: z.string() }),
  }),
]);
```

## 게임 생명주기

```
1. 페이지 로드 → iframe src 설정
2. Game: READY → Platform: INIT (userId, nickname, gameId)
3. 게임 플레이 중 → Game: SCORE (선택적)
4. 탭 비활성화 → Platform: PAUSE / 탭 활성화 → Platform: RESUME
5. 게임 종료 → Game: GAME_OVER (score, playtime)
6. Platform: 랭킹 API 호출 → History 기록 → 결과 화면 표시
7. 페이지 이탈 → Platform: TERMINATE
```

## 점수 제출 플로우

```
Game: GAME_OVER { score, playtime }
  → Platform: POST /api/ranks { gameId, score }
  → Platform: POST /api/histories { eventType: 'GAME_OVER', ... }
  → 결과 화면 (점수, 랭킹, 다시하기)
```

## 에러 처리

| 에러 코드       | 설명                  | 대응                 |
| --------------- | --------------------- | -------------------- |
| `LOAD_FAILED`   | 게임 로드 실패        | 재시도 버튼 표시     |
| `INIT_FAILED`   | 초기화 실패           | 에러 메시지 + 재시도 |
| `RUNTIME_ERROR` | 런타임 에러           | 에러 메시지 + 나가기 |
| `TIMEOUT`       | READY 타임아웃 (10초) | 로딩 실패 메시지     |

## 보안 고려사항

1. **origin 검증**: 모든 postMessage 수신 시 `event.origin` 검증 필수
2. **메시지 스키마 검증**: Zod로 메시지 형식 검증
3. **iframe sandbox**: 최소 권한 원칙 적용
4. **환경변수**: CDN URL은 반드시 환경변수 사용
5. **점수 검증**: 서버 사이드에서 비정상 점수 필터링 (향후 구현)
