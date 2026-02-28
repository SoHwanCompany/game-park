# /feature - Feature 모듈 생성

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

새로운 feature 모듈 구조를 생성합니다.

## 사용법

```
/feature cart
/feature user-profile
```

## 생성 구조

```
src/features/<feature-name>/
├── components/     # feature 전용 컴포넌트
├── hooks/          # feature 전용 훅
├── types/          # feature 전용 타입
├── utils/          # feature 전용 유틸리티
└── index.ts        # public exports
```

## 규칙

1. 디렉토리명: kebab-case
2. index.ts에서 외부 노출 항목만 export
3. feature 간 직접 import 금지 (공통 모듈 사용)

## 생성 후

- 컴포넌트 추가: `/component ComponentName --feature=<name>`
