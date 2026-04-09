# AGENTS.md

Codex는 이 프로젝트에서 **`CLAUDE.md`와 `.claude/`를 규칙의 단일 원본(source of truth)** 으로 간주하고 그대로 따른다.

## 우선순위

1. `CLAUDE.md`
2. `.claude/agents/`, `.claude/commands/`, `.claude/memory/`, `.claude/pr-rules.md`
3. `docs/coding-conventions.md`, `docs/testing.md`, 기타 프로젝트 문서
4. 이 파일

충돌이 발생하면 항상 상위 우선순위를 따른다.

## Codex 작업 프로토콜

1. 코드 생성·수정 전 `CLAUDE.md`를 기준 규칙으로 읽고 따른다.
2. 코드 작업 시 `docs/coding-conventions.md`를 Read 도구로 읽는다.
3. 테스트 작성·수정 시 `docs/testing.md`를 Read 도구로 읽는다.
4. 작업 성격에 따라 다음 문서를 추가로 참조한다.
   - 게임 통합: `docs/game-integration.md`
   - UI/디자인: `docs/design-system.md`, `docs/ui-patterns.md`
   - PR 작성: `.claude/pr-rules.md`, `.github/pull_request_template.md`
5. 코드 작성이 끝나면 `pnpm lint:fix && pnpm format`을 실행하고, 에러가 없을 때까지 반복한다.

## 운영 원칙

- Codex용 별도 복제 규칙 세트를 만들지 않는다.
- Claude 설정이 변경되면 Codex도 그 변경을 **참조 방식으로 즉시 상속**한다.
- 새 규칙·커맨드·메모리·에이전트는 `.claude/` 쪽에만 추가한다.
- 이 파일은 Codex가 Claude 환경을 올바르게 참조하도록 연결하는 최소 안내만 유지한다.
