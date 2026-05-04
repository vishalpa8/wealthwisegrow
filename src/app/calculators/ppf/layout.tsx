import type { ReactNode } from 'react';
import { getCalculatorPageMetadata } from '@/lib/seo/calculator-pages';

export const metadata = getCalculatorPageMetadata('ppf');

export default function CalculatorRouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

