'use client';

import dynamic from 'next/dynamic';
import { AdsPlaceholder } from './ads-placeholder';

const AdSense = dynamic(() => import('./adsense'), {
  ssr: false,
  loading: () => <AdsPlaceholder />,
});

export interface AdSenseWrapperProps {
  adSlot: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSenseWrapper({ adSlot, className, style }: AdSenseWrapperProps) {
  return <AdSense adSlot={adSlot} className={className} style={style} />;
}
