---
description: '시드 데이터 관리'
allowed-tools: Read, Bash
---

# /dev:seed — 시드 데이터 관리

데이터베이스 시드 데이터를 실행하거나 리셋한다.

## 사용법

```
/dev:seed              # seed.ts 실행
/dev:seed reset        # DB 리셋 + 시딩
```

## 절차

### 기본 실행 (`/dev:seed`)

1. `prisma/seed.ts`를 Read로 확인
2. 시드 실행:

```bash
pnpm db:seed
```

### 리셋 (`/dev:seed reset`)

1. 사용자에게 DB 리셋 경고 (모든 데이터 삭제됨)
2. 승인 후 실행:

```bash
pnpm db:push --force-reset && pnpm db:seed
```

## 주의사항

- `reset`은 모든 데이터를 삭제한다. 반드시 사용자 승인 후 실행
- 프로덕션 환경에서는 절대 실행 금지
- 시드 데이터 수정이 필요하면 `/code:schema seed` 사용

## 인수: $ARGUMENTS
