---
description: '어드민 패널 스캐폴딩'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# /code:admin — 어드민 패널 스캐폴딩

어드민 페이지와 관련 컴포넌트를 생성한다.

## 사용법

```
/code:admin game-register   # 게임 등록 (S3 presigned URL 업로드)
/code:admin game-manage     # 게임 관리 CRUD
/code:admin genre-manage    # 장르 관리
/code:admin user-manage     # 사용자 관리
/code:admin dashboard       # 대시보드
```

## 절차

1. `docs/coding-conventions.md`를 Read로 읽는다
2. `docs/design-system.md`를 Read로 읽는다
3. 기존 어드민 코드를 확인한다
4. 요청된 어드민 페이지를 생성한다
5. `pnpm lint:fix && pnpm format` 실행

## 공통 규칙

- 경로: `src/app/(admin)/admin/{name}/page.tsx`
- 레이아웃: `src/app/(admin)/layout.tsx` (사이드바 + 메인 콘텐츠)
- 권한 검증: 어드민 권한 확인 (미들웨어 또는 서버 컴포넌트에서)
- 사이드바 레이아웃 사용 (`docs/ui-patterns.md` 어드민 대시보드 패턴 참조)

## 타입별 생성 가이드

### game-register — 게임 등록

- 게임 코드, 이름, 설명, 장르 선택
- S3 presigned URL 기반 파일 업로드 (빌드 zip 또는 폴더)
- 썸네일 이미지 업로드
- CloudFront URL 자동 생성
- React Hook Form + Zod 검증

### game-manage — 게임 관리

- 게임 목록 테이블 (검색, 필터, 페이지네이션)
- 게임 상태 변경 (ACTIVE/INACTIVE)
- 게임 수정/삭제
- 좋아요 수, 플레이 수 표시

### genre-manage — 장르 관리

- 장르 목록 테이블
- 장르 추가/수정/삭제
- 장르별 게임 수 표시

### user-manage — 사용자 관리

- 사용자 목록 테이블 (검색, 필터)
- 사용자 상태 변경 (ACTIVE/SUSPENDED/BANNED)
- 경험치 조정
- 사용자 상세 정보 보기

### dashboard — 대시보드

- 통계 카드: 총 게임 수, 총 사용자 수, 오늘 플레이 수
- 최근 등록된 게임
- 인기 게임 차트
- 최근 가입 사용자

## 인수: $ARGUMENTS
