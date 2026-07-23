import { type Metadata } from 'next';
import Link from 'next/link';

import { SITE_NAME } from '@/lib/site';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Game Park 소개',
  description:
    'Game Park가 어떤 게임을 제공하고 플레이 가이드를 어떻게 만들며 서비스를 어떤 기준으로 운영하는지 안내합니다.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">서비스 소개</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{SITE_NAME}는 무엇인가요?</h1>
        <p className="text-muted-foreground text-lg leading-8">
          {SITE_NAME}는 설치 없이 브라우저에서 바로 시작할 수 있는 미니게임을 모아 제공하는
          플랫폼입니다. 짧은 휴식에도 규칙을 빠르게 이해하고 플레이를 시작할 수 있도록 게임과 한국어
          가이드를 함께 제공합니다.
        </p>
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">우리가 해결하려는 문제</h2>
        <div className="space-y-4 leading-8">
          <p>
            웹 게임을 처음 열었을 때 규칙을 찾기 어렵거나, 다운로드와 회원가입 과정이 길어 실제
            플레이까지 이어지지 않는 경우가 많습니다. Game Park는 공개된 게임을 나열하는 데서 끝내지
            않고 게임별 규칙, 조작법, 초보 전략을 한국어로 정리해 시작 장벽을 낮춥니다.
          </p>
          <p>
            플레이어는 회원가입 없이 게임을 둘러보고 실행할 수 있습니다. 로그인하면 좋아요, 랭킹,
            경험치, 의견 게시판과 같은 참여 기능을 이용할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">게임과 콘텐츠 선정 기준</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 leading-8">
          <li>현대적인 웹 브라우저에서 별도 프로그램 설치 없이 실행할 수 있는가</li>
          <li>조작과 목표를 플레이어에게 명확하게 안내하는가</li>
          <li>짧은 세션에서도 퍼즐 해결, 점수 향상, 전략 선택 같은 완결된 경험을 주는가</li>
          <li>저작권과 이용자 안전을 해치는 요소가 없는가</li>
          <li>Game Park가 자체 설명과 가이드로 이용자에게 추가 가치를 제공할 수 있는가</li>
        </ul>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">플레이 가이드</h2>
          <p className="text-muted-foreground mt-3 leading-7">
            게임 화면에서 확인되는 규칙과 기능을 바탕으로 초보자가 실제로 막히는 순서에 맞춰
            작성합니다. 확인되지 않은 공략이나 승리를 보장하는 표현은 사용하지 않습니다.
          </p>
          <Link href="/editorial-policy" className="mt-4 inline-block underline underline-offset-4">
            편집 원칙 보기
          </Link>
        </div>
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">이용자 의견</h2>
          <p className="text-muted-foreground mt-3 leading-7">
            게임 오류, 설명의 잘못된 부분, 원하는 게임을 의견 게시판에서 접수합니다. 운영 상태와
            답변은 공개된 게시글에서 확인할 수 있습니다.
          </p>
          <Link href="/feedback" className="mt-4 inline-block underline underline-offset-4">
            의견 게시판 보기
          </Link>
        </div>
      </section>

      <section className="bg-muted/40 mt-10 rounded-xl p-6">
        <h2 className="text-xl font-semibold">운영 주체와 투명성</h2>
        <p className="text-muted-foreground mt-3 leading-7">
          본 서비스와 사이트의 편집 콘텐츠는 Game Park 운영팀이 관리합니다. 광고가 제공되는 경우에도
          광고주가 게임 순서나 가이드 결론을 결정하지 않으며, 광고 영역은 콘텐츠와 구분해
          표시합니다. 개인정보 처리와 외부 서비스 사용 내역은 개인정보처리방침에서 확인할 수
          있습니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/guides">가이드 읽기</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">문의하기</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
