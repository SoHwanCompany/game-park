# Pitfalls

자주 발생하는 실수와 해결법

---

### GitHub Packages 인증 오류 (pnpm install 실패)

- **상황**: `pnpm install` 실행 시 `@doubltworks/tokens` 패키지에서 401 Unauthorized
- **원인**: `.npmrc`의 GitHub 토큰에 `read:packages` 권한이 없음
- **해결**: GitHub에서 `read:packages` 권한이 포함된 PAT 발급 후 `.npmrc` 업데이트

### ESLint padding-line-between-statements 룰

- **상황**: 코드 생성 시 `render()`, `expect()` 등 표현식 문(expression statement) 사이에 빈 줄이 없으면 ESLint 에러 발생
- **원인**: 프로젝트 ESLint에 `padding-line-between-statements` 규칙이 활성화되어 있음
- **해결**: 코드 작성 시 항상 `pnpm eslint --fix`로 확인하거나, 변수 선언/함수 호출 사이에 빈 줄을 넣어서 작성
- **팁**: 특히 테스트 파일에서 `render()` 호출 앞에 빈 줄을 빠뜨리기 쉬움

### 한 파일에 여러 컴포넌트 정의 금지

- **상황**: 컴포넌트 생성 시 헬퍼/내부 컴포넌트를 같은 파일에 정의
- **규칙**: `components/ui/**` 외에는 **한 파일에 하나의 컴포넌트만 정의**
- **주의**: "내부 전용이라 괜찮다"는 판단은 규칙 위반임. 예외 없음
- **해결**: 헬퍼 컴포넌트도 반드시 같은 폴더 내 별도 파일로 분리
