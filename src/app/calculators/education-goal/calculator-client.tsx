'use client';

import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { secureCalculation } from '@/lib/security';

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

function calculateEducationPlan(inputs: typeof initialValues) {
  const {
    childAge,
    courseDuration,
    startingAge,
    currentCost,
    expectedInflation,
    existingSavings,
    expectedReturn
  } = inputs;

  // Calculate time until education starts
  const yearsToStart = startingAge - childAge;
  
  // Calculate future cost using compound inflation
  const futureCost = currentCost * Math.pow(1 + expectedInflation / 100, yearsToStart);
  
  // Calculate total education cost considering duration
  const totalFutureCost = futureCost * courseDuration;
  
  // Calculate future value of existing savings
  const futureSavings = existingSavings * Math.pow(1 + expectedReturn / 100, yearsToStart);
  
  // Calculate required corpus
  const requiredCorpus = totalFutureCost - futureSavings;
  
  // Calculate monthly SIP required
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = yearsToStart * 12;
  
  const monthlyInvestment = requiredCorpus / 
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * 
    (1 + monthlyRate);

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
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Child\'s Current Age',
      name: 'childAge',
      type: 'number',
      placeholder: '5',
      min: 0,
      max: 17,
      required: true,
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
      required: true,
      tooltip: 'Select the type of education course'
    },
    {
      label: 'Current Course Cost (Annual)',
      name: 'currentCost',
      type: 'number',
      placeholder: '1,50,000',
      min: 10000,
      max: 10000000,
      required: true,
      tooltip: 'Current annual cost of the course'
    },
    {
      label: 'Course Duration (Years)',
      name: 'courseDuration',
      type: 'number',
      placeholder: '4',
      min: 1,
      max: 10,
      required: true,
      tooltip: 'Duration of the course in years'
    },
    {
      label: 'Education Starting Age',
      name: 'startingAge',
      type: 'number',
      placeholder: '18',
      min: 15,
      max: 25,
      required: true,
      tooltip: 'Age at which education will start'
    },
    {
      label: 'Expected Education Inflation (%)',
      name: 'expectedInflation',
      type: 'percentage',
      placeholder: '10',
      min: 5,
      max: 20,
      step: 0.1,
      required: true,
      tooltip: 'Expected annual increase in education costs'
    },
    {
      label: 'Existing Education Savings',
      name: 'existingSavings',
      type: 'number',
      placeholder: '0',
      min: 0,
      required: true,
      tooltip: 'Amount already saved for education'
    },
    {
      label: 'Expected Investment Return (%)',
      name: 'expectedReturn',
      type: 'percentage',
      placeholder: '12',
      min: 6,
      max: 18,
      step: 0.1,
      required: true,
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

  // Handle course type change
  const handleCourseTypeChange = (value: string) => {
    const course = courseTypes[value as keyof typeof courseTypes];
    setValues(prev => ({
      ...prev,
      courseType: value,
      currentCost: course.baseAmount,
      expectedInflation: course.inflation
    }));
  };

  const results = useMemo(() => {
    try {
      setError('');

      // Validate inputs
      if (values.startingAge <= values.childAge) {
        setError('Starting age must be greater than current age');
        return [];
      }

      const result = secureCalculation(
        'education-planning',
        values,
        () => calculateEducationPlan(values)
      );

      if (!result) {
        setError('Calculation failed. Please verify your inputs.');
        return [];
      }

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Required Monthly Investment',
          value: result.monthlyInvestment,
          type: 'currency',
          highlight: true,
          tooltip: 'Monthly investment needed to reach your education goal'
        },
        {
          label: 'Total Future Cost',
          value: result.totalFutureCost,
          type: 'currency',
          tooltip: 'Estimated total cost of education in future'
        },
        {
          label: 'Years Until Education',
          value: result.yearsToStart,
          type: 'number',
          tooltip: 'Years remaining until education starts'
        },
        {
          label: 'Future Value of Current Savings',
          value: result.futureSavings,
          type: 'currency',
          tooltip: 'How much your existing savings will grow to'
        },
        {
          label: 'Additional Corpus Required',
          value: result.requiredCorpus,
          type: 'currency',
          tooltip: 'Additional amount needed after considering existing savings'
        },
        {
          label: 'Impact of Inflation',
          value: result.inflationImpact,
          type: 'currency',
          tooltip: 'Increase in cost due to inflation'
        },
        {
          label: 'Annual Investment Required',
          value: result.yearlyInvestment,
          type: 'currency',
          tooltip: 'Yearly investment needed'
        }
      ];

      return calculatorResults;
    } catch (err) {
      console.error('Education planning calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    if (name === 'courseType') {
      handleCourseTypeChange(value);
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Education Planning Calculator"
        description="Plan for your children's education by calculating future costs and required monthly savings."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={results}
        loading={loading}
        error={error}
        showComparison={true}
      />
    </div>
  );
}
