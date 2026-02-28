# /review-branch - 동료 브랜치 코드 리뷰

동료의 브랜치를 워크트리로 격리하여 코드 리뷰를 수행합니다.
현재 작업 중인 브랜치에 영향 없이 리뷰할 수 있습니다.

## 사용법

```
/review-branch feat/jeh/cart       # 브랜치명으로 리뷰
/review-branch 58                  # PR 번호로 리뷰
```

## 인자

- `$ARGUMENTS`: 리뷰 대상 브랜치명 또는 PR 번호 (필수)

## 실행

1. 인자가 없으면 사용자에게 브랜치명 또는 PR 번호를 요청
2. 인자가 숫자인지 확인하여 분기:
   - **숫자**: PR 번호로 판단 → `gh pr view <번호>`로 PR 정보와 브랜치명 확인
   - **문자열**: 브랜치명으로 판단
3. `git fetch origin <브랜치명>`으로 최신 코드 가져오기
4. **code-reviewer 서브에이전트**를 워크트리 격리 모드(`isolation: "worktree"`)로 호출하여 리뷰 위임:
   - 워크트리에서 해당 브랜치를 체크아웃
   - `develop`과의 diff를 기반으로 변경 파일 분석
   - 프로젝트 컨벤션(`CLAUDE.md`, `docs/coding-conventions.md`) 기준으로 리뷰
5. 서브에이전트의 리뷰 결과를 사용자에게 전달
6. 리뷰 결과에 Critical/Important 이슈가 있으면 PR에 코멘트를 남길지 사용자에게 확인

## 서브에이전트 프롬프트 템플릿

```
다음 브랜치의 코드를 리뷰합니다: {브랜치명}

1. `git checkout {브랜치명}`으로 전환
2. `git log --oneline origin/develop..HEAD`로 커밋 목록 확인
3. `git diff origin/develop...HEAD`로 전체 변경사항 확인
4. 변경된 파일을 읽고 프로젝트 컨벤션 기준으로 리뷰
5. Critical / Important / Minor 레벨로 이슈 분류하여 리포트 작성
```

## 주의사항

- 워크트리는 리뷰 완료 후 자동 정리됨 (변경사항 없으므로)
- 현재 작업 브랜치의 코드에 영향 없음
- PR 코멘트는 사용자 확인 후에만 작성
