import { type Metadata } from 'next';
import Link from 'next/link';

import { SITE_NAME, SITE_URL } from '@/lib/site';

const PRIVACY_EFFECTIVE_DATE = '2026년 6월 24일';

const collectedItems = [
  {
    title: '회원가입 및 로그인',
    items: ['이메일 주소', '닉네임', '암호화된 비밀번호', '카카오 계정 식별자 및 프로필 정보'],
  },
  {
    title: '서비스 이용',
    items: ['좋아요 기록', '게임 플레이 기록', '점수 및 랭킹 기록', '경험치 및 레벨 정보'],
  },
  {
    title: '의견 게시판 및 신고',
    items: ['게시글 제목과 내용', '댓글', '신고 사유와 상세 내용', '처리 상태 및 운영 로그'],
  },
  {
    title: '자동 수집 정보',
    items: ['쿠키', '접속 로그', '기기 및 브라우저 정보', '페이지 방문 및 이벤트 데이터'],
  },
] as const;

const thirdPartyServices = [
  {
    name: 'Google AdSense',
    purpose: '광고 게재, 광고 성과 측정, 개인 맞춤 광고 제공 여부 관리',
  },
  {
    name: 'Google Analytics',
    purpose: '방문 통계, 페이지 이용 흐름 분석, 서비스 품질 개선',
  },
  {
    name: 'Kakao',
    purpose: '소셜 로그인과 계정 인증',
  },
  {
    name: 'Vercel, Neon, AWS S3/CloudFront',
    purpose: '서비스 호스팅, 데이터 저장, 게임 파일 및 이미지 제공',
  },
] as const;

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description:
    'Game Park의 개인정보 수집, 이용, 보관, 제3자 서비스, 광고 쿠키 및 사용자 권리 안내입니다.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: `개인정보처리방침 | ${SITE_NAME}`,
    description:
      'Game Park의 개인정보 수집, 이용, 보관, 제3자 서비스, 광고 쿠키 및 사용자 권리 안내입니다.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">시행일: {PRIVACY_EFFECTIVE_DATE}</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">개인정보처리방침</h1>
        <p className="text-muted-foreground leading-7">
          {SITE_NAME}는 브라우저 기반 게임 플랫폼을 제공하기 위해 필요한 최소한의 개인정보를
          처리합니다. 본 방침은 사용자가 어떤 정보가 수집되고, 어떤 목적으로 사용되며, 광고 및 분석
          서비스에서 쿠키가 어떻게 활용되는지 이해할 수 있도록 설명합니다.
        </p>
      </div>

      <section className="mt-10 space-y-4 rounded-lg border p-5">
        <h2 className="text-xl font-semibold">Google 광고 및 CMP 안내</h2>
        <div className="text-muted-foreground space-y-3 leading-7">
          <p>
            {SITE_NAME}는 Google AdSense를 통해 광고를 게재할 수 있습니다. Google 및 Google의 광고
            파트너는 쿠키 또는 이와 유사한 기술을 사용하여 사용자의 이전 방문 기록을 기반으로 광고를
            제공하거나 광고 성과를 측정할 수 있습니다.
          </p>
          <p>
            유럽 경제 지역(EEA), 영국, 스위스 등 관련 법령상 동의가 필요한 지역의 사용자는 Google
            인증 동의 관리 플랫폼(CMP)을 통해 광고 쿠키, 개인 맞춤 광고, 측정 목적의 데이터 사용에
            동의하거나 거부하고 세부 옵션을 관리할 수 있습니다.
          </p>
          <p>
            Google이 동의를 받은 뒤 개인정보를 사용하는 방식은{' '}
            <a
              href="https://business.safety.google/privacy/"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              Google 비즈니스 데이터 책임 사이트
            </a>
            에서 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">1. 수집하는 개인정보 항목</h2>
        <div className="space-y-5">
          {collectedItems.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="font-semibold">{group.title}</h3>
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 leading-7">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">2. 개인정보 이용 목적</h2>
        <ul className="text-muted-foreground list-disc space-y-2 pl-5 leading-7">
          <li>회원 식별, 로그인, 계정 관리, 부정 이용 방지</li>
          <li>게임 플레이, 좋아요, 랭킹, 경험치 등 핵심 서비스 제공</li>
          <li>의견 게시판, 신고 처리, 운영 문의 대응</li>
          <li>서비스 안정성 확보, 오류 분석, 보안 모니터링</li>
          <li>광고 게재, 광고 성과 측정, 방문 통계 분석 및 서비스 개선</li>
          <li>마케팅 수신에 동의한 사용자에 대한 소식 안내</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">3. 쿠키 및 유사 기술</h2>
        <div className="text-muted-foreground space-y-3 leading-7">
          <p>
            서비스는 로그인 상태 유지, 소셜 회원가입 동의 확인, 통계 분석, 광고 제공을 위해 쿠키
            또는 브라우저 저장소를 사용할 수 있습니다. 사용자는 브라우저 설정을 통해 쿠키 저장을
            제한하거나 삭제할 수 있습니다. 다만 필수 쿠키를 차단하면 로그인 등 일부 기능이
            정상적으로 동작하지 않을 수 있습니다.
          </p>
          <p>
            Google의 광고 쿠키 사용 방식은{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              Google 광고 기술 안내
            </a>
            에서 확인할 수 있습니다. 개인 맞춤 광고를 원하지 않는 경우{' '}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              Google 광고 설정
            </a>
            에서 선택을 변경할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">4. 제3자 서비스</h2>
        <p className="text-muted-foreground leading-7">
          서비스 제공을 위해 아래 외부 서비스를 사용할 수 있으며, 각 서비스는 자체 정책에 따라
          정보를 처리할 수 있습니다.
        </p>
        <div className="overflow-hidden rounded-lg border">
          {thirdPartyServices.map((service) => (
            <div
              key={service.name}
              className="grid gap-2 border-b p-4 last:border-b-0 md:grid-cols-3"
            >
              <strong>{service.name}</strong>
              <p className="text-muted-foreground md:col-span-2">{service.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">5. 개인정보 보관 및 파기</h2>
        <div className="text-muted-foreground space-y-3 leading-7">
          <p>
            개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기하거나 비활성화합니다. 단, 관계
            법령 준수, 분쟁 대응, 부정 이용 방지, 서비스 운영 기록 보존이 필요한 경우 필요한
            범위에서 일정 기간 보관할 수 있습니다.
          </p>
          <p>
            회원 탈퇴 시 계정 상태는 탈퇴로 전환되며 소셜 로그인 연결 정보는 삭제됩니다. 랭킹,
            피드백, 신고 처리 기록 등 서비스 운영상 필요한 기록은 관련 목적 달성 또는 보관 기간 경과
            후 파기됩니다.
          </p>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">6. 사용자 권리</h2>
        <p className="text-muted-foreground leading-7">
          사용자는 본인의 개인정보 열람, 정정, 삭제, 처리 정지, 동의 철회를 요청할 수 있습니다. 계정
          정보는 마이페이지에서 일부 수정할 수 있으며, 추가 요청은{' '}
          <Link href="/feedback" className="text-foreground underline underline-offset-4">
            의견 게시판
          </Link>
          을 통해 접수할 수 있습니다.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">7. 개인정보 보호 조치</h2>
        <p className="text-muted-foreground leading-7">
          {SITE_NAME}는 접근 권한 관리, 인증 정보 보호, HTTPS 통신, 운영자 권한 제한, 감사 로그 기록
          등 합리적인 보호 조치를 적용합니다. 외부 인프라와 제3자 서비스는 각 제공자의 보안 정책과
          보호 조치를 함께 따릅니다.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">8. 방침 변경</h2>
        <p className="text-muted-foreground leading-7">
          본 방침은 서비스 기능, 법령, 제3자 서비스 정책 변경에 따라 수정될 수 있습니다. 중요한
          변경이 있는 경우 서비스 내 공지 또는 본 페이지의 시행일 변경으로 안내합니다.
        </p>
      </section>

      <p className="text-muted-foreground mt-10 text-sm break-all">
        개인정보처리방침 URL: {`${SITE_URL}/privacy`}
      </p>
    </main>
  );
}
