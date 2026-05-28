# /release - 릴리즈 (Ship 단계)

배포 준비 상태를 검증하고 릴리즈 노트를 생성합니다. `release-manager` 서브에이전트에게 위임합니다.

## 사용법

```
/release              # 표준 릴리즈 준비
/release v1.2.0       # 버전 태그 지정
```

## 실행

`release-manager` 서브에이전트를 호출하여 아래 프로세스를 수행합니다.

1. **전체 변경 분석**: `git log develop...HEAD`, `git diff develop...HEAD --stat`으로 모든 커밋과 변경 파일 파악
2. **배포 전 체크리스트** (8개 항목):
   - TypeScript 타입 검사 (`pnpm type-check`)
   - ESLint 검사 (`pnpm lint`)
   - 미사용 코드 검사 (`pnpm knip`)
   - 테스트 (`pnpm test`)
   - 미커밋 변경사항 (`git status`)
   - `.env` 변경 여부
   - 패키지 변경 여부 (`package.json`, `pnpm-lock.yaml`)
   - DB 스키마 변경 여부 (`prisma/schema.prisma`)
3. **릴리즈 노트 초안**: 커밋을 level별로 분류하여 작성
4. **판정**: READY 또는 NOT READY

### READY인 경우

- 릴리즈 노트를 사용자에게 보여주고 확인을 받는다
- `gh pr create --base develop`로 PR을 생성한다

### NOT READY인 경우

- 블로커 목록과 해결 방안을 보여준다
- 사용자가 문제를 수정한 뒤 `/release`를 다시 실행한다

## /release vs /pr 비교

| 항목   | /release               | /pr              |
| ------ | ---------------------- | ---------------- |
| 검증   | 8개 항목 자동 검증     | 검증 없음        |
| 내용   | 릴리즈 노트 + PR       | PR만 생성        |
| 게이트 | READY/NOT READY 판정   | 무조건 생성      |
| 용도   | 기능 개발 완료 후 배포 | 단순 변경사항 PR |

## 언제 /release를 사용하는가

- 기능 개발이 완료되어 develop에 병합할 때
- 여러 커밋이 쌓인 피처 브랜치를 정리할 때
- 배포 전 최종 안전 검증이 필요할 때
- `/validate` -> `/commit` -> **`/release`** -> 배포 흐름의 마지막 단계

## 언제 /pr을 대신 사용하는가

- 문서(docs)나 설정(config) 등 단순 변경
- 이미 수동으로 모든 검증을 마친 경우
- 빠른 핫픽스로 체크리스트가 불필요한 경우
