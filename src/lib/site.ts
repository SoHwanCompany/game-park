export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://game-park.vercel.app';

export const SITE_NAME = 'Game Park';

export const SITE_TITLE = 'Game Park - 직장인을 위한 1분 브라우저 미니게임';

export const SITE_DESCRIPTION =
  '직장인 심심할 때, 점심시간과 쉬는 시간에 설치 없이 바로 즐기는 무료 브라우저 미니게임 플랫폼. 짧고 가벼운 웹 게임을 플레이하세요.';

export const SITE_KEYWORDS = [
  '직장인 심심할 때',
  '직장인 게임',
  '쉬는 시간 게임',
  '점심시간 게임',
  '월루 게임',
  '월급 루팡 게임',
  '설치 없는 게임',
  '짧은 미니게임',
  '무료 웹 게임',
  '브라우저 게임',
  '온라인 게임',
  '캐주얼 게임',
  '게임파크',
] as const;

export const SITE_TAGLINE = '직장인의 1분 휴식처';

export const SITE_HERO_TITLE = '직장인의 1분 휴식처, Game Park';

export const SITE_HERO_DESCRIPTION =
  '회의 전, 점심시간, 퇴근 전 잠깐 심심할 때 설치 없이 바로 플레이하세요. 업무 흐름을 깨지 않는 짧고 가벼운 브라우저 미니게임을 모았습니다.';

export const SEO_FAQS = [
  {
    question: 'Game Park는 설치가 필요한가요?',
    answer: '아니요. 별도 설치 없이 브라우저에서 바로 플레이할 수 있습니다.',
  },
  {
    question: '직장인이 쉬는 시간에 하기 좋은 게임인가요?',
    answer:
      '짧은 플레이 흐름의 미니게임을 중심으로 제공해 점심시간, 회의 전후, 퇴근 전 휴식 시간에 가볍게 즐기기 좋습니다.',
  },
  {
    question: '월루 게임이나 월급 루팡 게임을 찾을 때도 쓸 수 있나요?',
    answer:
      '업무를 방해하지 않는 선에서 짧게 쉬고 싶을 때 적합한 설치 없는 웹 게임을 제공합니다. 노골적인 우회보다 건강한 짧은 휴식을 권장합니다.',
  },
] as const;
