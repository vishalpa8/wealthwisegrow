'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from '@/lib/utils/number';

const courseTypes = {
  engineering: {
    name: 'Engineering/Technical',
    baseAmount: 1500000, // Current average cost
    inflation: 10 // Higher inflation for technical education
  },
  medical: {
    name: 'Medical',
    baseAmount: 2500000,
    inflation: 12
  },
  management: {
    name: 'Management (MBA)',
    baseAmount: 2000000,
    inflation: 11
  },
  liberal: {
    name: 'Liberal Arts/Commerce',
    baseAmount: 800000,
    inflation: 8
  },
  abroad: {
    name: 'Study Abroad',
    baseAmount: 5000000,
    inflation: 15
  },
  custom: {
    name: 'Custom Course',
    baseAmount: 1000000,
    inflation: 10
  }
};

const initialValues = {
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

function calculateEducationPlan(inputs: EducationGoalInputs) {
  // Use parseRobustNumber for flexible input handling
  const childAge = Math.max(0, Math.min(25, Math.abs(parseRobustNumber(inputs.childAge)) || 5));
  const courseDuration = Math.max(1, Math.abs(parseRobustNumber(inputs.courseDuration)) || 4);
  const startingAge = Math.max(15, Math.min(30, Math.abs(parseRobustNumber(inputs.startingAge)) || 18));
  const currentCost = Math.abs(parseRobustNumber(inputs.currentCost)) || 100000;
  const expectedInflation = Math.max(0, Math.abs(parseRobustNumber(inputs.expectedInflation)) || 10);
  const existingSavings = Math.abs(parseRobustNumber(inputs.existingSavings)) || 0;
  const expectedReturn = Math.max(0, Math.abs(parseRobustNumber(inputs.expectedReturn)) || 12);

  // Calculate time until education starts
  const yearsToStart = Math.max(1, startingAge - childAge);
  
  // Calculate future cost using compound inflation
  const futureCost = currentCost * Math.pow(1 + expectedInflation / 100, yearsToStart);
  
  // Calculate total education cost considering duration
  const totalFutureCost = futureCost * courseDuration;
  
  // Calculate future value of existing savings
  const futureSavings = existingSavings * Math.pow(1 + expectedReturn / 100, yearsToStart);
  
  // Calculate required corpus
  const requiredCorpus = Math.max(0, totalFutureCost - futureSavings);
  
  // Calculate monthly SIP required
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = yearsToStart * 12;
  
  let monthlyInvestment = 0;
  if (requiredCorpus > 0) {
    if (monthlyRate === 0) {
      monthlyInvestment = requiredCorpus / totalMonths;
    } else {
      // Correct SIP formula: PMT = FV * r / ((1 + r)^n - 1)
      // This calculates the monthly payment needed to reach the required corpus
      monthlyInvestment = (requiredCorpus * monthlyRate) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
  }

  return {
    yearsToStart,
    futureCost,
    totalFutureCost,
    futureSavings,
    requiredCorpus,
    monthlyInvestment,
    yearlyInvestment: monthlyInvestment * 12,
    inflationImpact: totalFutureCost - (currentCost * courseDuration)
  };
}

export default function EducationPlanningCalculatorClient() {
  const [values, setValues] = useState<EducationGoalInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const educationResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateEducationPlan(values);
      return calculation;
    } catch (err: any) {
      console.error('Education planning calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
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
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!educationResults) return [];

    return [
      {
        label: 'Required Monthly Investment',
        value: educationResults.monthlyInvestment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly investment needed to reach your education goal'
      },
      {
        label: 'Total Future Cost',
        value: educationResults.totalFutureCost,
        type: 'currency',
        tooltip: 'Estimated total cost of education in future'
      },
      {
        label: 'Years Until Education',
        value: educationResults.yearsToStart,
        type: 'number',
        tooltip: 'Years remaining until education starts'
      },
      {
        label: 'Future Value of Current Savings',
        value: educationResults.futureSavings,
        type: 'currency',
        tooltip: 'How much your existing savings will grow to'
      },
      {
        label: 'Additional Corpus Required',
        value: educationResults.requiredCorpus,
        type: 'currency',
        tooltip: 'Additional amount needed after considering existing savings'
      },
      {
        label: 'Impact of Inflation',
        value: educationResults.inflationImpact,
        type: 'currency',
        tooltip: 'Increase in cost due to inflation'
      },
      {
        label: 'Annual Investment Required',
        value: educationResults.yearlyInvestment,
        type: 'currency',
        tooltip: 'Yearly investment needed'
      }
    ];
  }, [educationResults, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    if (name === 'courseType') {
      const course = courseTypes[value as keyof typeof courseTypes];
      setValues(prev => ({
        ...prev,
        courseType: value,
        currentCost: course.baseAmount,
        expectedInflation: course.inflation
      }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 500);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
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
    <CalculatorLayout
      title="Education Planning Calculator"
      description="Plan for your children's education by calculating future costs and required monthly savings."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Education Details"
        description="Enter details about your child's education goals."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={educationResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}