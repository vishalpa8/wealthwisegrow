'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AdsPlaceholder } from './ads-placeholder';

// Function to check if adblock is enabled
const checkAdBlocker = async (): Promise<boolean> => {
  try {
    await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return false;
  } catch {
    return true;
  }
};

interface AdSenseProps {
  adSlot: string;
  style?: React.CSSProperties;
  className?: string;
}

export const AdSense: React.FC<AdSenseProps> = ({ adSlot, style, className }) => {
  const adRef = useRef<HTMLModElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Check for adblocker
  useEffect(() => {
    checkAdBlocker().then(blocked => {
      setIsAdBlocked(blocked);
      if (blocked) {
        setHasError(true);
      }
    });
  }, []);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (typeof window !== 'undefined' && !isAdBlocked) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              try {
                const adsbygoogle = (window as any).adsbygoogle || [];
                adsbygoogle.push({
                  callback: () => {
                    setIsLoading(false);
                    setHasError(false);
                  }
                });
              } catch (err) {
                console.error('AdSense error:', err);
                setHasError(true);
              }
            } else {
              setIsVisible(false);
            }
          });
        },
        { threshold: 0.1 }
      );

      if (adRef.current) {
        observer.observe(adRef.current);
      }

    }
    
    return () => {
      if (observer && adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, [isAdBlocked]);

  // Show nothing if ad is blocked or has error
  if (isAdBlocked || (hasError && !isLoading)) {
    return null;
  }

  // Show placeholder in development
  if (process.env.NODE_ENV === 'development') {
    return <AdsPlaceholder className={className} style={style} />;
  }

  return (
    <div
      className={`relative transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ minHeight: style?.height || 'auto' }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <AdsPlaceholder 
            className={className} 
            style={style} 
          />
        </div>
      )}
      <ins
        ref={adRef}
        className={`adsbygoogle ${className || ''}`}
        style={{
          display: 'block',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          ...style,
        }}
        data-ad-client="ca-pub-3402658627618101"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense;
