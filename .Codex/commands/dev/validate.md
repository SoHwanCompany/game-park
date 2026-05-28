# /validate - 전체 검증

프로젝트 전체 검증을 실행합니다.

## 실행 항목

1. TypeScript 타입 체크 (`pnpm type-check`)
2. ESLint 검사 (`pnpm lint`)
3. 미사용 코드 검사 (`pnpm knip`)

## 사용법

```
/validate        # 전체 검증
/validate --fix  # 자동 수정 가능한 것들 수정
```

## --fix 옵션

- ESLint 자동 수정: `pnpm lint:fix`
- Prettier 포맷팅: `pnpm format`

## 오류 발생 시

1. 오류 내용 분석
2. 수정 방안 제시
3. 사용자 확인 후 수정 진행
