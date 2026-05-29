# Claude Code 서브에이전트 가이드

Claude Code에서 사용할 수 있는 전문화된 서브에이전트와 브레인스토밍 커맨드 사용법.

## 서브에이전트란?

서브에이전트는 특정 작업에 전문화된 AI 어시스턴트다. 메인 대화와 **격리된 컨텍스트**에서 실행되므로 메인 대화가 오염되지 않고, 각 에이전트가 자신의 역할에 집중할 수 있다.

```
메인 세션 ──→ 서브에이전트 (격리된 컨텍스트)
              ├── 전문화된 시스템 프롬프트
              ├── 제한된 도구 세트
              └── 결과만 메인 세션에 반환
```

## 에이전트 목록

| 에이전트          | 모델    | 역할                                   | 사용 가능한 도구                            |
| ----------------- | ------- | -------------------------------------- | ------------------------------------------- |
| `code-reviewer`   | Sonnet  | 프로젝트 컨벤션 기반 코드 리뷰         | Read, Glob, Grep, Bash                      |
| `test-runner`     | Sonnet  | 테스트 실행 및 실패 분석               | Bash, Read, Glob, Grep                      |
| `doc-writer`      | Sonnet  | 기술 문서 작성                         | Read, Write, Edit, Glob, Grep, Bash         |
| `implementer`     | inherit | 태스크 단위 기능 구현                  | 전체                                        |
| `product-advisor` | inherit | 제품 판단 (Go/No-Go/Pivot)             | Read, Glob, Grep, Bash, WebSearch, WebFetch |
| `qa-engineer`     | inherit | 시나리오 기반 QA 검증                  | Read, Glob, Grep, Bash, WebFetch            |
| `release-manager` | Sonnet  | 배포 전 체크리스트 검증 및 릴리즈 관리 | Read, Glob, Grep, Bash                      |

## 사용법

### 자연어 요청

Claude에게 자연어로 요청하면 적절한 에이전트가 자동으로 위임된다.

```
"이 코드 리뷰해줘"         → code-reviewer
"테스트 돌려줘"            → test-runner
"설계 문서 작성해줘"        → doc-writer
"이 태스크 구현해줘"        → implementer
```

### 슬래시 커맨드

기존 커맨드를 통해서도 에이전트가 활용된다.

```
/review                    → code-reviewer 에이전트에게 위임
/review src/path/file.tsx  → 특정 파일 리뷰
```

### 에이전트 직접 지정

특정 에이전트를 명시적으로 지정할 수도 있다.

```
"code-reviewer 에이전트로 develop 대비 변경사항 리뷰해줘"
"test-runner 에이전트로 변경된 파일 관련 테스트만 돌려줘"
```

## 각 에이전트 상세

### code-reviewer

프로젝트 코딩 컨벤션(`docs/coding-conventions.md`)을 기준으로 코드를 심층 리뷰한다.

**체크 항목:**

- 코드 작성 규칙 (화살표 함수, named export, kebab-case 등. Next.js 규약 파일은 `export default function` 허용)
- TypeScript 규칙 (any 금지, interface 우선, nullish coalescing 등)
- React 규칙 (React 19 패턴, JSX 안전성 등)
- 컴포넌트 규칙 (한 파일 하나 컴포넌트, CVA + cn() 등)
- Import 규칙 (중복/순환 금지)

**출력 형식:**

- 이슈를 Critical / Important / Minor로 분류
- 각 이슈에 파일:라인, 설명, 수정 방안 포함

### test-runner

Vitest 테스트를 실행하고 실패 원인을 분석한다.

**기능:**

- 전체 테스트 또는 변경 파일 관련 테스트만 선택 실행
- 실패 시 스택 트레이스 분석 + 소스 코드까지 추적
- 수정 방안 제시 (직접 수정은 사용자 확인 후)

### doc-writer

프로젝트 스타일에 맞는 기술 문서를 작성한다.

**작성 가능한 문서:**

- 설계 문서 (`docs/plans/YYYY-MM-DD-<주제>.md`)
- 개발 가이드 (`docs/<주제>.md`)
- Claude 메모리 (`.claude/memory/`)

### implementer

개별 구현 태스크를 위임받아 독립적으로 수행한다.

**절차:**

1. 코딩 컨벤션 확인
2. 기존 코드/공통 컴포넌트 조사
3. 구현 + lint/format 검증
4. 자기 검토 후 결과 보고

## 브레인스토밍 커맨드

### /brainstorm

기능 구현 전에 아이디어를 탐색하고 설계를 확정하는 협업 프로세스.

```
/brainstorm 장바구니 기능
/brainstorm 실시간 알림 시스템
```

**프로세스:**

```
1. 프로젝트 컨텍스트 파악
2. 요구사항 질문 (한 번에 하나씩)
3. 2-3가지 접근법 제안 + 비교
4. 설계 섹션별 제시 + 승인
5. 설계 문서 저장 (docs/plans/)
6. 구현 전환
```

**핵심 원칙:**

- 설계 승인 전 코드 작성 금지
- 질문은 한 번에 하나씩
- 항상 2-3가지 대안 제시
- YAGNI 적용

## 파일 구조

```
.claude/
├── agents/                  # 서브에이전트 정의
│   ├── code-reviewer.md     # 코드 리뷰
│   ├── test-runner.md       # 테스트 실행/분석
│   ├── doc-writer.md        # 문서 작성
│   ├── implementer.md       # 기능 구현
│   ├── ui-designer.md       # AI 주도 UI 설계/구현
│   ├── game-integrator.md   # iframe 게임 통합
│   ├── product-advisor.md   # 제품 판단 (gstack)
│   ├── qa-engineer.md       # QA 검증 (gstack)
│   └── release-manager.md   # 릴리즈 관리 (gstack)
├── commands/
│   ├── dev/
│   │   ├── brainstorm.md    # 브레인스토밍 커맨드
│   │   ├── review.md        # 코드 리뷰 커맨드 (code-reviewer 연동)
│   │   ├── office-hours.md  # 제품 판단 (product-advisor 연동)
│   │   └── qa.md            # QA 검증 (qa-engineer 연동)
│   └── git/
│       └── release.md       # 릴리즈 (release-manager 연동)
└── ...
```

## 주의사항

- 서브에이전트는 **명시적 요청 시에만** 동작한다. 자동으로 호출되지 않는다.
- 서브에이전트는 다른 서브에이전트를 호출할 수 없다 (중첩 불가).
- 각 에이전트는 격리된 컨텍스트에서 실행되므로 메인 대화의 이전 맥락을 모른다. 필요한 정보는 요청 시 함께 전달해야 한다.
