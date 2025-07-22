import { generateCalculatorMetadata } from '@/lib/seo/metadata';
import BreakEvenCalculator from './BreakEvenCalculator';

export const metadata = generateCalculatorMetadata(
  'break-even',
  'Break-even Point Calculator',
  'Calculate the point at which total revenue equals total costs, indicating when your business becomes profitable.'
);

export default BreakEvenCalculator;