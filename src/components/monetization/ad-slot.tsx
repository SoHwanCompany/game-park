'use client';

import { useEffect } from 'react';

import { cn } from '@/lib/utils';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const DEFAULT_AD_SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

const AD_SLOT_IDS = {
  gameDetail: process.env.NEXT_PUBLIC_ADSENSE_GAME_DETAIL_SLOT_ID ?? DEFAULT_AD_SLOT_ID,
  gameList: process.env.NEXT_PUBLIC_ADSENSE_GAME_LIST_SLOT_ID ?? DEFAULT_AD_SLOT_ID,
  ranking: process.env.NEXT_PUBLIC_ADSENSE_RANKING_SLOT_ID ?? DEFAULT_AD_SLOT_ID,
} as const;

type AdPlacement = keyof typeof AD_SLOT_IDS;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

export const AdSlot = ({ placement, className }: AdSlotProps) => {
  const slotId = AD_SLOT_IDS[placement];

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !slotId) {
      return;
    }

    window.adsbygoogle = window.adsbygoogle ?? [];
    window.adsbygoogle.push({});
  }, [slotId]);

  if (!ADSENSE_CLIENT_ID || !slotId) {
    return null;
  }

  return (
    <aside
      aria-label="광고"
      className={cn(
        'bg-muted/30 my-8 overflow-hidden rounded-lg border border-dashed p-4',
        className,
      )}
    >
      <p className="text-muted-foreground mb-3 text-center text-xs">광고</p>
      <ins
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-format="auto"
        data-ad-slot={slotId}
        data-full-width-responsive="true"
        style={{ display: 'block', minHeight: 90 }}
      />
    </aside>
  );
};
