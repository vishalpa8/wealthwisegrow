import { generateCalculatorMetadata } from '@/lib/seo/metadata';
import BreakEvenCalculatorClient from './client';

export const metadata = generateCalculatorMetadata(
  'break-even',
  'Break-even Point Calculator',
  'Calculate the point at which total revenue equals total costs, indicating when your business becomes profitable.'
);

export default function BreakEvenCalculatorPage() {
  return <BreakEvenCalculatorClient />;
}
