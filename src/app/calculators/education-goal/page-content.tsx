"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";
import { calculateFutureValue, calculateRequiredSIP } from "@/lib/calculations/financial-math";

const courseTypes = {
  engineering: { name: 'Engineering/Technical', baseAmount: 1500000, inflation: 10 },
  medical: { name: 'Medical', baseAmount: 2500000, inflation: 12 },
  management: { name: 'Management (MBA)', baseAmount: 2000000, inflation: 11 },
  liberal: { name: 'Liberal Arts/Commerce', baseAmount: 800000, inflation: 8 },
  abroad: { name: 'Study Abroad', baseAmount: 5000000, inflation: 15 },
  custom: { name: 'Custom Course', baseAmount: 1000000, inflation: 10 }
};

interface EducationGoalInputs {
  childAge: number;
  courseType: string;
  courseDuration: number;
  startingAge: number;
  currentCost: number;
  expectedInflation: number;
  existingSavings: number;
  expectedReturn: number;
  riskProfile: string;
}

const initialValues: EducationGoalInputs = {
  childAge: 5,
  courseType: 'engineering',
  courseDuration: 4,
  startingAge: 18,
  currentCost: courseTypes.engineering.baseAmount,
  expectedInflation: courseTypes.engineering.inflation,
  existingSavings: 0,
  expectedReturn: 12,
  riskProfile: 'moderate'
};

export function EducationGoalContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Child\'s Current Age',
      name: 'childAge',
      type: 'number',
      placeholder: '5',
      tooltip: 'Current age of your child'
    },
    {
      label: 'Course Type',
      name: 'courseType',
      type: 'select',
      options: Object.entries(courseTypes).map(([key, value]) => ({
        value: key,
        label: value.name
      })),
      tooltip: 'Select the type of education course'
    },
    {
      label: 'Current Course Cost (Annual)',
      name: 'currentCost',
      type: 'number',
      placeholder: '1,50,000',
      unit: currency.symbol,
      tooltip: 'Current annual cost of the course'
    },
    {
      label: 'Course Duration (Years)',
      name: 'courseDuration',
      type: 'number',
      placeholder: '4',
      tooltip: 'Duration of the course in years'
    },
    {
      label: 'Education Starting Age',
      name: 'startingAge',
      type: 'number',
      placeholder: '18',
      tooltip: 'Age at which education will start'
    },
    {
      label: 'Expected Education Inflation (%)',
      name: 'expectedInflation',
      type: 'percentage',
      placeholder: '10',
      step: 0.1,
      tooltip: 'Expected annual increase in education costs'
    },
    {
      label: 'Existing Education Savings',
      name: 'existingSavings',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      tooltip: 'Amount already saved for education'
    },
    {
      label: 'Expected Investment Return (%)',
      name: 'expectedReturn',
      type: 'percentage',
      placeholder: '12',
      step: 0.1,
      tooltip: 'Expected annual return on your investments'
    },
    {
      label: 'Risk Profile',
      name: 'riskProfile',
      type: 'select',
      options: [
        { value: 'conservative', label: 'Conservative (Debt-focused)' },
        { value: 'moderate', label: 'Moderate (Balanced)' },
        { value: 'aggressive', label: 'Aggressive (Equity-focused)' }
      ],
      tooltip: 'Your investment risk tolerance'
    }
  ], [currency.symbol]);

  const calculate = (inputs: EducationGoalInputs) => {
    const childAge = Math.max(0, Math.min(25, Math.abs(parseRobustNumber(inputs.childAge)) || 5));
    const courseDuration = Math.max(1, Math.abs(parseRobustNumber(inputs.courseDuration)) || 4);
    const startingAge = Math.max(15, Math.min(30, Math.abs(parseRobustNumber(inputs.startingAge)) || 18));
    const currentCost = Math.abs(parseRobustNumber(inputs.currentCost)) || 100000;
    const expectedInflation = Math.max(0, Math.abs(parseRobustNumber(inputs.expectedInflation)) || 10);
    const existingSavings = Math.abs(parseRobustNumber(inputs.existingSavings)) || 0;
    const expectedReturn = Math.max(0, Math.abs(parseRobustNumber(inputs.expectedReturn)) || 12);

    const yearsToStart = Math.max(1, startingAge - childAge);
    const futureCost = calculateFutureValue(currentCost, expectedInflation, yearsToStart);
    const totalFutureCost = futureCost * courseDuration;
    const futureSavings = calculateFutureValue(existingSavings, expectedReturn, yearsToStart);
    const requiredCorpus = Math.max(0, totalFutureCost - futureSavings);
    
    const totalMonths = yearsToStart * 12;
    
    const monthlyInvestment = calculateRequiredSIP(requiredCorpus, expectedReturn, totalMonths);

    const yearlyInvestment = monthlyInvestment * 12;
    const inflationImpact = totalFutureCost - (currentCost * courseDuration);

    const results: CalculatorResult[] = [
      {
        label: 'Required Monthly Investment',
        value: monthlyInvestment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly investment needed to reach your education goal'
      },
      {
        label: 'Total Future Cost',
        value: totalFutureCost,
        type: 'currency',
        tooltip: 'Estimated total cost of education in future'
      },
      {
        label: 'Years Until Education',
        value: yearsToStart,
        type: 'number',
        tooltip: 'Years remaining until education starts'
      },
      {
        label: 'Future Value of Current Savings',
        value: futureSavings,
        type: 'currency',
        tooltip: 'How much your existing savings will grow to'
      },
      {
        label: 'Additional Corpus Required',
        value: requiredCorpus,
        type: 'currency',
        tooltip: 'Additional amount needed after considering existing savings'
      },
      {
        label: 'Impact of Inflation',
        value: inflationImpact,
        type: 'currency',
        tooltip: 'Increase in cost due to inflation'
      },
      {
        label: 'Annual Investment Required',
        value: yearlyInvestment,
        type: 'currency',
        tooltip: 'Yearly investment needed'
      }
    ];

    return { results };
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Education Planning Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Start early to benefit from compounding.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Factor in inflation to estimate future costs accurately.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider education loans as a last resort.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseCalculatorTemplate<EducationGoalInputs>
      title="Education Planning Calculator"
      description="Plan for your children's education by calculating future costs and required monthly savings."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
