# Game Park

브라우저 기반 웹 게임 플랫폼

## 운영 연동

성장/수익화/모니터링 기능은 환경변수가 있을 때만 활성화된다.

| 목적           | 환경변수                                  | 적용 내용                                    |
| -------------- | ----------------------------------------- | -------------------------------------------- |
| SEO 기준 URL   | `NEXT_PUBLIC_SITE_URL`                    | canonical, sitemap, robots, JSON-LD 기준 URL |
| 사용자 분석    | `NEXT_PUBLIC_GA_MEASUREMENT_ID`           | GA4 page view 및 게임 이벤트 수집            |
| 수익화         | `NEXT_PUBLIC_ADSENSE_CLIENT_ID`           | AdSense 자동 광고 스크립트 로드              |
| 수익화 슬롯    | `NEXT_PUBLIC_ADSENSE_SLOT_ID`             | 공통 디스플레이 광고 슬롯                    |
| 게임 상세 광고 | `NEXT_PUBLIC_ADSENSE_GAME_DETAIL_SLOT_ID` | 게임 상세 하단 광고 슬롯                     |
| 게임 목록 광고 | `NEXT_PUBLIC_ADSENSE_GAME_LIST_SLOT_ID`   | 게임 목록 상단 광고 슬롯                     |
| 랭킹 광고      | `NEXT_PUBLIC_ADSENSE_RANKING_SLOT_ID`     | 랭킹 하단 광고 슬롯                          |
| 오류 모니터링  | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`    | Sentry 클라이언트/서버 오류 수집             |
| 성능 샘플링    | `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`   | Sentry trace 샘플 비율, 기본값 `0.1`         |

외부 uptime 모니터는 `/api/health`를 호출하면 된다. 응답에는 DB 연결 상태, 응답 시간,
GA/AdSense/Sentry/Site URL 설정 여부가 포함된다.
