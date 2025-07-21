'use client';

import dynamic from 'next/dynamic';

const BreakEvenCalculator = dynamic(
  () => import('./BreakEvenCalculator'),
  { 
    ssr: false,
    loading: () => <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">Loading calculator...</div>
  }
);

export default function BreakEvenCalculatorClient() {
  return <BreakEvenCalculator />;
}
