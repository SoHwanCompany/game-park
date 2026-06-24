'use client';

import { Suspense, useEffect } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

type GtagCommand =
  | ['js', Date]
  | ['config', string, Record<string, unknown>?]
  | ['event', string, Record<string, unknown>?];

declare global {
  interface Window {
    dataLayer?: GtagCommand[];
    gtag?: (...args: GtagCommand) => void;
  }
}

interface AnalyticsProviderProps {
  gaMeasurementId?: string;
}

interface RouteAnalyticsProps {
  gaMeasurementId: string;
}

export const trackEvent = (eventName: string, params?: Record<string, unknown>): void => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, params);
};

const RouteAnalytics = ({ gaMeasurementId }: RouteAnalyticsProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) {
      return;
    }

    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    window.gtag('config', gaMeasurementId, {
      page_path: pagePath,
    });
  }, [gaMeasurementId, pathname, searchParams]);

  return null;
};

export const AnalyticsProvider = ({ gaMeasurementId }: AnalyticsProviderProps) => (
  <>
    {gaMeasurementId ? (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', { send_page_view: false });
          `}
        </Script>
        <Suspense fallback={null}>
          <RouteAnalytics gaMeasurementId={gaMeasurementId} />
        </Suspense>
      </>
    ) : null}
  </>
);
