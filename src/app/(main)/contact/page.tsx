import { type Metadata } from 'next';
import Link from 'next/link';

import { SITE_NAME } from '@/lib/site';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '문의 및 오류 제보',
  description:
    'Game Park의 게임 오류, 가이드 수정, 계정과 개인정보, 광고 관련 문의 접수 방법을 안내합니다.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Game Park 운영팀</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">문의 및 오류 제보</h1>
        <p className="text-muted-foreground text-lg leading-8">
          게임이 정상적으로 열리지 않거나 가이드 내용이 실제 규칙과 다를 때, 계정 또는 개인정보
          처리가 궁금할 때 의견 게시판으로 알려주세요.
        </p>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">공개 의견과 게임 제안</h2>
          <p className="text-muted-foreground mt-3 leading-7">
            기능 제안, 게임 요청, 일반 의견은 의견 게시판에 남길 수 있습니다. 처리 상태와 운영팀
            답변을 게시글에서 확인할 수 있습니다.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/feedback/new">의견 작성하기</Link>
          </Button>
        </div>
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">오류와 콘텐츠 수정</h2>
          <p className="text-muted-foreground mt-3 leading-7">
            문제가 발생한 페이지 주소, 게임 이름, 사용한 브라우저와 재현 순서를 함께 적어주세요.
            가이드 수정은 잘못된 문장과 실제 게임 화면의 차이를 알려주면 확인에 도움이 됩니다.
          </p>
          <Button className="mt-5" variant="outline" asChild>
            <Link href="/feedback">접수된 의견 보기</Link>
          </Button>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">문의 유형별 안내</h2>
        <div className="divide-y rounded-xl border">
          {[
            {
              title: '게임 실행 및 점수 문제',
              description:
                '게임 이름, 발생 시각, 오류 직전 동작, 재현 여부를 적어주세요. 계정이 관련된 경우 이메일 대신 닉네임만 적어도 됩니다.',
            },
            {
              title: '가이드와 사이트 콘텐츠',
              description:
                '해당 페이지 주소와 수정이 필요한 문장을 알려주세요. 운영팀이 게임의 현재 규칙과 대조해 반영 여부를 검토합니다.',
            },
            {
              title: '계정 및 개인정보',
              description:
                '열람, 정정, 삭제, 처리 정지, 동의 철회 요청은 의견 게시판에서 접수합니다. 본인 확인이 필요한 요청에는 추가 절차를 안내할 수 있습니다.',
            },
            {
              title: '광고 관련 문제',
              description:
                '콘텐츠를 가리거나 오해를 유발하는 광고를 발견했다면 페이지 주소와 광고가 표시된 위치를 알려주세요.',
            },
          ].map((item) => (
            <div key={item.title} className="p-5">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-muted-foreground mt-2 leading-7">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="bg-muted/40 mt-10 rounded-xl p-6">
        <h2 className="text-lg font-semibold">개인정보를 공개 글에 남기지 마세요</h2>
        <p className="text-muted-foreground mt-2 leading-7">
          비밀번호, 인증 토큰, 주민등록번호, 결제 정보처럼 민감한 정보는 게시글에 작성하지 마세요.{' '}
          {SITE_NAME} 운영팀은 문의 처리를 위해 비밀번호를 요구하지 않습니다.
        </p>
        <Link href="/privacy" className="mt-3 inline-block text-sm underline underline-offset-4">
          개인정보처리방침 보기
        </Link>
      </aside>
    </main>
  );
}
