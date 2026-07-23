import { type Metadata } from 'next';
import Link from 'next/link';

import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: '이용약관',
  description: 'Game Park 서비스 이용 조건, 회원 책임, 콘텐츠와 계정 운영 기준을 안내합니다.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">시행일: 2026년 7월 23일</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">이용약관</h1>
        <p className="text-muted-foreground text-lg leading-8">
          본 약관은 {SITE_NAME}가 제공하는 브라우저 게임, 회원 기능, 랭킹, 의견 게시판과 관련
          콘텐츠를 이용할 때 적용되는 기본 조건을 설명합니다.
        </p>
      </div>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">1. 서비스의 범위</h2>
        <p className="leading-8">
          이용자는 회원가입 없이 공개된 게임과 가이드를 열람할 수 있습니다. 좋아요, 랭킹, 경험치,
          의견 작성 등 일부 기능은 로그인이 필요합니다. 서비스의 구체적인 기능과 제공 방식은 운영상
          필요에 따라 변경될 수 있습니다.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">2. 계정 관리</h2>
        <p className="leading-8">
          이용자는 정확한 정보를 사용하고 본인의 로그인 수단을 안전하게 관리해야 합니다. 타인의
          계정을 사용하거나 계정 접근 권한을 부당하게 공유해서는 안 됩니다. 비정상적인 접근이나
          도용이 의심되면 즉시 운영팀에 알려야 합니다.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">3. 금지되는 이용</h2>
        <ul className="list-disc space-y-2 pl-5 leading-8">
          <li>점수, 랭킹, 좋아요 또는 경험치를 자동화 도구나 변조된 요청으로 조작하는 행위</li>
          <li>서비스의 정상 운영을 방해하거나 과도한 요청을 보내는 행위</li>
          <li>타인의 권리나 개인정보를 침해하는 게시글과 댓글을 작성하는 행위</li>
          <li>불법 정보, 혐오·괴롭힘, 음란물, 스팸 또는 악성 코드를 게시하거나 연결하는 행위</li>
          <li>게임과 사이트 자산을 허가 없이 복제, 재배포 또는 상업적으로 이용하는 행위</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">4. 콘텐츠와 지식재산권</h2>
        <div className="space-y-3 leading-8">
          <p>
            Game Park가 작성한 가이드, 설명, 사이트 디자인과 프로그램에 대한 권리는 Game Park 또는
            정당한 권리자에게 있습니다. 개별 게임과 게임 안의 이미지, 음악, 코드에 대한 권리는 해당
            제작자 또는 권리자에게 있습니다.
          </p>
          <p>
            이용자가 의견 게시판에 작성한 콘텐츠의 권리는 작성자에게 유지됩니다. 다만 서비스는
            게시물 표시, 운영, 신고 처리와 백업에 필요한 범위에서 해당 콘텐츠를 사용할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">5. 운영 조치와 책임</h2>
        <p className="leading-8">
          약관이나 관련 법령을 위반하거나 서비스 안정성을 해치는 이용에 대해서는 게시물 숨김, 점수
          삭제, 계정 제한 또는 이용 중단 조치를 할 수 있습니다. 점검, 장애, 외부 인프라 문제로
          서비스가 일시 중단될 수 있으며, 합리적인 범위에서 복구와 안내를 위해 노력합니다.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">6. 약관 변경과 문의</h2>
        <p className="leading-8">
          서비스 또는 법령 변경이 있을 때 약관을 수정할 수 있으며 중요한 변경은 시행일과 함께
          안내합니다. 약관 관련 질문은{' '}
          <Link href="/contact" className="underline underline-offset-4">
            문의 페이지
          </Link>
          에서 접수할 수 있습니다. 개인정보 처리에 관한 내용은{' '}
          <Link href="/privacy" className="underline underline-offset-4">
            개인정보처리방침
          </Link>
          을 확인하세요.
        </p>
      </section>
    </main>
  );
}
