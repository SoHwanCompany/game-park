# 의견 게시판 (Feedback Board) 설계

## 개요

플랫폼 사용자들의 의견을 수집하는 게시판. 로그인 사용자만 작성 가능하며, 카테고리 분류, 공개/비공개, 댓글, 블랙리스트 기능을 포함한다.

## 데이터 모델

### FeedbackCategory (enum)

BUG, FEATURE, GENERAL, GAME_REQUEST, OTHER

### Feedback

| 필드           | 타입                    | 설명                          |
| -------------- | ----------------------- | ----------------------------- |
| id             | cuid                    | PK                            |
| userId         | FK->User                | 작성자                        |
| title          | VarChar(100)            | 제목                          |
| content        | Text                    | 본문                          |
| category       | FeedbackCategory        | 카테고리                      |
| customCategory | VarChar(50)?            | category=OTHER일 때 직접 입력 |
| isPublic       | Boolean (default: true) | 공개 여부                     |
| createdAt      | DateTime                | 작성일                        |
| updatedAt      | DateTime                | 수정일                        |

### FeedbackComment

| 필드       | 타입         | 설명      |
| ---------- | ------------ | --------- |
| id         | cuid         | PK        |
| feedbackId | FK->Feedback | 게시글    |
| userId     | FK->User     | 작성자    |
| content    | Text         | 댓글 내용 |
| createdAt  | DateTime     | 작성일    |

### 블랙리스트

기존 User.status = SUSPENDED 활용. 정지 사용자는 작성/댓글 불가.

## 페이지 구조

| 라우트         | 설명                               | 접근 권한                            |
| -------------- | ---------------------------------- | ------------------------------------ |
| /feedback      | 목록 (카테고리 필터, 페이지네이션) | 누구나                               |
| /feedback/new  | 작성 폼                            | 로그인 필수                          |
| /feedback/[id] | 상세 + 댓글                        | 공개: 누구나 / 비공개: 작성자+관리자 |

- (main) 라우트 그룹 배치
- 헤더에 "의견" 메뉴 추가
- error.tsx 에러 바운더리 적용

## API

| 메서드 | 엔드포인트                              | 설명      | 권한                                 |
| ------ | --------------------------------------- | --------- | ------------------------------------ |
| GET    | /api/feedback                           | 목록 조회 | 누구나                               |
| POST   | /api/feedback                           | 글 작성   | 로그인 + 비정지                      |
| GET    | /api/feedback/[id]                      | 상세 조회 | 공개: 누구나 / 비공개: 작성자+관리자 |
| DELETE | /api/feedback/[id]                      | 글 삭제   | 작성자 또는 관리자                   |
| POST   | /api/feedback/[id]/comments             | 댓글 작성 | 로그인 + 비정지                      |
| DELETE | /api/feedback/[id]/comments/[commentId] | 댓글 삭제 | 작성자 또는 관리자                   |

## 비공개 글 정책

- 목록: 공개 글 + 본인 비공개 글만 표시
- 상세: 작성자 본인 + ADMIN만 접근 가능
- 타인 비공개 글 접근 시 404 반환
