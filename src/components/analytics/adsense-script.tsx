"use client";

import Script from "next/script";
import { useConsent } from "@/contexts/consent-context";

const PUBLISHER_ID = "ca-pub-3402658627618101";

export function AdSenseScript() {
  const { advertisingAllowed } = useConsent();
  const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  if (!adsEnabled || !advertisingAllowed) return null;

  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
    />
  );
}
