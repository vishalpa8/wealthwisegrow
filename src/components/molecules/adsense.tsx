"use client";

import { CSSProperties, useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, never>>;
  }
}

interface AdSenseProps {
  adSlot: string;
  style?: CSSProperties;
  className?: string;
}

export default function AdSense({ adSlot, style, className }: AdSenseProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("Unable to initialize AdSense unit", error);
    }
  }, []);

  if (!/^\d+$/.test(adSlot)) return null;

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={style}
      data-ad-client="ca-pub-3402658627618101"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
