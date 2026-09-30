'use client';

import dynamic from 'next/dynamic';
import { useConsent } from '@/contexts/consent-context';

const AdSense = dynamic(() => import('./adsense'), {
  ssr: false,
  loading: () => <div className='w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded'>Advertisement</div>,
});

export interface AdSenseWrapperProps {
  adSlot: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSenseWrapper({ adSlot, className, style }: AdSenseWrapperProps) {
  const { advertisingAllowed } = useConsent();
  if (
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'true' ||
    !advertisingAllowed ||
    !/^\d+$/.test(adSlot)
  ) {
    return null;
  }

  return <AdSense adSlot={adSlot} className={className} style={style} />;
}
