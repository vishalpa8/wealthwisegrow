'use client';

import dynamic from 'next/dynamic';

const EducationPlanningCalculatorComponent = dynamic(
  () => import('./calculator-client'),
  { ssr: false }
);

export default function EducationPlanningCalculatorClient() {
  return <EducationPlanningCalculatorComponent />;
}
