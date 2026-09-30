"use client";

import Script from "next/script";
import { useConsent } from "@/contexts/consent-context";

export function GA4() {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  const { analyticsAllowed } = useConsent();

  if (!measurementId || !analyticsAllowed) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
