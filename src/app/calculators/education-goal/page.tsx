import { Metadata } from 'next';
import EducationPlanningCalculatorClient from './client';

export const metadata: Metadata = {
  title: 'Education Planning Calculator | WealthWise Hub',
  description: 'Plan for your children\'s education by calculating future costs and required monthly savings.',
  keywords: ['education planning', 'child education', 'education calculator', 'education savings', 'education inflation'],
};

export default function EducationPlanningCalculatorPage() {
  return <EducationPlanningCalculatorClient />;
}
