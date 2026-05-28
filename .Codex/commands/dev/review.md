# /review - 코드 리뷰

현재 변경사항 또는 지정 파일을 프로젝트 컨벤션 기준으로 리뷰합니다.

**code-reviewer 서브에이전트**에게 위임하여 격리된 컨텍스트에서 심층 리뷰를 수행합니다.

## 사용법

```
/review                                          # 현재 git diff 기준 리뷰
/review src/components/common/quick-menu.tsx     # 특정 파일 리뷰
```

## 실행

1. `git diff --name-only`로 변경된 파일 목록 확인 (인자가 없을 때)
2. **code-reviewer 서브에이전트**를 호출하여 리뷰 위임
   - 인자로 파일 경로가 있으면 해당 파일을 리뷰 대상으로 전달
   - 없으면 변경된 파일 목록을 리뷰 대상으로 전달
3. 서브에이전트의 리뷰 결과를 사용자에게 전달
4. Critical/Important 이슈가 있으면 수정 여부를 사용자에게 확인
