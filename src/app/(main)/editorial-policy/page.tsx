import { type Metadata } from 'next';
import Link from 'next/link';

import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: '편집 원칙',
  description:
    'Game Park 플레이 가이드의 작성 기준, 검토 방식, 수정 정책과 광고 독립성 원칙을 안내합니다.',
  alternates: {
    canonical: '/editorial-policy',
  },
};

export default function EditorialPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">최종 업데이트: 2026년 7월 23일</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">편집 원칙</h1>
        <p className="text-muted-foreground text-lg leading-8">
          {SITE_NAME}의 플레이 가이드는 검색 유입을 위한 문장 채우기가 아니라, 이용자가 게임 규칙을
          이해하고 스스로 더 나은 판단을 할 수 있도록 돕기 위해 작성합니다.
        </p>
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">1. 출처와 확인 범위</h2>
        <div className="space-y-3 leading-8">
          <p>
            가이드에는 실제 게임 화면에서 제공되는 규칙, 조작 안내, 난이도, 모드와 결과 체계를
            우선적으로 사용합니다. 게임의 공식 설명과 Game Park에 등록된 정보도 함께 대조합니다.
          </p>
          <p>
            화면에서 확인할 수 없는 확률, 숨겨진 보상, 내부 계산식은 사실처럼 단정하지 않습니다.
            전략 팁은 규칙에서 합리적으로 적용할 수 있는 판단 기준과 초보자의 실수를 줄이는 방법에
            한정합니다.
          </p>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">2. 작성과 검토 과정</h2>
        <ol className="list-decimal space-y-3 pl-5 leading-8">
          <li>게임의 목표, 조작법, 승리·실패 조건과 난이도를 확인합니다.</li>
          <li>처음 시작하는 이용자가 따라 할 수 있는 순서로 설명을 다시 구성합니다.</li>
          <li>게임 안의 표현과 가이드 내용이 서로 모순되지 않는지 확인합니다.</li>
          <li>과장, 불필요한 반복, 확인할 수 없는 주장을 제거한 뒤 게시합니다.</li>
          <li>게임 기능이 바뀌거나 오류 제보가 접수되면 해당 가이드의 수정 필요성을 검토합니다.</li>
        </ol>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">3. 수정과 업데이트</h2>
        <p className="leading-8">
          각 가이드에는 마지막 업데이트 날짜를 표시합니다. 규칙이나 조작법처럼 결과에 영향을 주는
          내용이 달라지면 본문과 업데이트 날짜를 함께 수정합니다. 단순 문장 다듬기처럼 의미가 변하지
          않는 편집은 별도 변경 이력을 남기지 않을 수 있습니다.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">4. 광고와 편집 독립성</h2>
        <p className="leading-8">
          광고주와 광고 네트워크는 게임의 선정 순서, 가이드의 결론, 평가 표현을 결정하지 않습니다.
          광고가 표시되는 영역은 콘텐츠와 시각적으로 구분하고, 광고 때문에 중요한 설명을 가리거나
          클릭을 유도하지 않습니다.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">5. 오류 제보</h2>
        <p className="leading-8">
          잘못된 규칙, 오래된 설명, 이해하기 어려운 문장을 발견했다면{' '}
          <Link href="/contact" className="underline underline-offset-4">
            문의 페이지
          </Link>
          를 통해 알려주세요. 재현 가능한 정보와 해당 가이드 주소를 함께 보내면 더 빠르게 확인할 수
          있습니다.
        </p>
      </section>
    </main>
  );
}
