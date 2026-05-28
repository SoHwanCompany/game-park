---
description: 'Prisma 스키마 변경 및 관련 코드 생성'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /code:schema — Prisma 스키마 변경 + 관련 코드 생성

Prisma 스키마를 변경하고 관련 타입, API 코드를 생성한다.

## 사용법

```
/code:schema add-model Rank       # 새 모델 추가
/code:schema modify Game          # 기존 모델 수정
/code:schema seed genres          # 시드 데이터 추가/수정
```

## 절차

### 1. 현재 스키마 확인

```
Read prisma/schema.prisma
```

### 2. 스키마 변경

- `prisma/schema.prisma` 수정
- 컨벤션 준수: `@@map("테이블명")`, `@default(cuid())`, 복합 키는 `@@id`
- FK 관계 및 인덱스 적절하게 설정

### 3. Prisma 클라이언트 생성

```bash
pnpm db:generate
```

### 4. 마이그레이션 필요 여부 확인

기존 데이터가 있는 경우 마이그레이션 필요:

```bash
pnpm db:migrate --name {migration-name}
```

개발 환경에서 리셋이 가능한 경우:

```bash
pnpm db:push
```

### 5. 시드 데이터 수정 (필요 시)

`prisma/seed.ts` 수정.

### 6. 타입 정리

필요 시 `src/types/` 에 관련 타입 추가.

### 7. 검증

```bash
pnpm db:generate && pnpm type-check
```

## 모델 설계 규칙

- PK: `@id @default(cuid())`
- 복합 PK: `@@id([field1, field2])`
- UK: `@unique`
- FK: `@relation(fields: [...], references: [...])`
- 타임스탬프: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- 상태: `status String @default("ACTIVE")`
- 테이블 매핑: `@@map("snake_case_plural")`
- 인덱스: 자주 조회되는 필드에 `@@index`

## 인수: $ARGUMENTS
