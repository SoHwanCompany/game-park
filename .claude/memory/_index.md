# Learnings Index

> **Claude Code가 자동 관리하는 프로젝트 지식 저장소**
> 이 파일은 목차와 핵심 요약만 담고, 상세 내용은 개별 파일에 기록한다.

## 파일 구조

| 파일              | 용도                            |
| ----------------- | ------------------------------- |
| `patterns.md`     | 프로젝트에서 반복되는 코드 패턴 |
| `pitfalls.md`     | 자주 발생하는 실수와 해결법     |
| `decisions.md`    | 기술적 결정과 그 이유           |
| `dependencies.md` | 의존성, 환경설정 관련 이슈      |

## 핵심 요약

> 자주 참조해야 하는 중요 사항만 여기에 요약. 상세 내용은 개별 파일 참조.

- `@doubltworks/tokens` 패키지는 GitHub Packages에서 관리됨 → PAT에 `read:packages` 권한 필요
- ESLint `padding-line-between-statements` 활성화 → 코드 생성 시 문(statement) 사이 빈 줄 필수

---

## 관리 규칙

1. **새 항목 추가 시**: 해당 카테고리 파일에 기록 + 중요하면 여기 요약에도 추가
2. **파일이 100줄 초과 시**: 하위 파일로 분리 (예: `pitfalls/auth.md`)
3. **오래된 정보**: 해결되거나 변경된 사항은 삭제하거나 업데이트
