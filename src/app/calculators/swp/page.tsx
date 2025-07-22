'use client';

import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { secureCalculation } from '@/lib/security';
// import { useCachedCalculation } from '@/lib/utils/cache';

const initialValues = {
  totalCorpus: 1000000,
  monthlyWithdrawal: 10000,
  expectedReturn: 8,
  inflationRate: 6,
  withdrawalIncrease: 5
};

function calculateSWP(inputs: typeof initialValues) {
  const {
    totalCorpus,
    monthlyWithdrawal,
    expectedReturn,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    inflationRate,
    withdrawalIncrease
  } = inputs;

  const monthlyRate = expectedReturn / 12 / 100;
  // const monthlyInflation = inflationRate / 12 / 100;
  const monthlyWithdrawalIncrease = withdrawalIncrease / 12 / 100;

  let remainingCorpus = totalCorpus;
  let currentWithdrawal = monthlyWithdrawal;
  let totalWithdrawn = 0;
  let months = 0;

  while (remainingCorpus > 0 && months < 600) { // Max 50 years
    // Add returns for the month
    remainingCorpus *= (1 + monthlyRate);
    
    // Deduct withdrawal
    remainingCorpus -= currentWithdrawal;
    totalWithdrawn += currentWithdrawal;
    
    // Increase withdrawal amount for next month
    currentWithdrawal *= (1 + monthlyWithdrawalIncrease);
    
    months++;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  return {
    months,
    years,
    remainingMonths,
    totalWithdrawn,
    remainingCorpus: Math.max(0, remainingCorpus),
    lastWithdrawalAmount: currentWithdrawal,
    yearlyWithdrawalFirstYear: monthlyWithdrawal * 12,
    yearlyWithdrawalLastYear: currentWithdrawal * 12
  };
}

export default function SWPCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Total Investment Corpus',
      name: 'totalCorpus',
      type: 'number',
      placeholder: '10,00,000',
      min: 100000,
      max: 1000000000,
      required: true,
      tooltip: 'Your total investment amount from which you plan to withdraw'
    },
    {
      label: 'Monthly Withdrawal Amount',
      name: 'monthlyWithdrawal',
      type: 'number',
      placeholder: '10,000',
      min: 1000,
      max: 10000000,
      required: true,
      tooltip: 'Amount you wish to withdraw each month'
    },
    {
      label: 'Expected Return Rate',
      name: 'expectedReturn',
      type: 'percentage',
      placeholder: '8',
      min: 1,
      max: 30,
      step: 0.1,
      required: true,
      tooltip: 'Expected annual return on your remaining investment'
    },
    {
      label: 'Inflation Rate',
      name: 'inflationRate',
      type: 'percentage',
      placeholder: '6',
      min: 0,
      max: 20,
      step: 0.1,
      required: true,
      tooltip: 'Expected annual inflation rate'
    },
    {
      label: 'Annual Withdrawal Increase',
      name: 'withdrawalIncrease',
      type: 'percentage',
      placeholder: '5',
      min: 0,
      max: 20,
      step: 0.1,
      required: true,
      tooltip: 'Yearly increase in withdrawal amount to combat inflation'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      
      // Validate inputs
      if (values.monthlyWithdrawal * 12 > values.totalCorpus * 0.5) {
        setError('Annual withdrawal should not exceed 50% of corpus for sustainability');
        return [];
      }

      const secureResult = secureCalculation(
        values,
        (validatedInputs) => calculateSWP(validatedInputs),
        {
          requiredFields: ['totalCorpus', 'monthlyWithdrawal', 'expectedReturn', 'inflationRate', 'withdrawalIncrease'],
          numericFields: ['totalCorpus', 'monthlyWithdrawal', 'expectedReturn', 'inflationRate', 'withdrawalIncrease'],
          minValues: {
            totalCorpus: 100000,
            monthlyWithdrawal: 1000,
            expectedReturn: 1,
            inflationRate: 0,
            withdrawalIncrease: 0
          },
          maxValues: {
            totalCorpus: 1000000000,
            monthlyWithdrawal: 10000000,
            expectedReturn: 30,
            inflationRate: 20,
            withdrawalIncrease: 20
          }
        }
      );

      const result = secureResult.result;

      if (!result) {
        setError('Calculation failed. Please verify your inputs.');
        return [];
      }

      const withdrawalRate = (values.monthlyWithdrawal * 12 / values.totalCorpus) * 100;

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Corpus Will Last For',
          value: `${result.years} years${result.remainingMonths ? ` and ${result.remainingMonths} months` : ''}`,
          // Changed from 'text' to a supported type without a formatter
          type: 'number',
          highlight: true,
          tooltip: 'Expected duration your corpus will last'
        },
        {
          label: 'Initial Withdrawal Rate',
          value: withdrawalRate,
          type: 'percentage',
          tooltip: 'Percentage of corpus withdrawn in first year'
        },
        {
          label: 'Total Amount Withdrawn',
          value: result.totalWithdrawn,
          type: 'currency',
          tooltip: 'Total amount you will withdraw over the period'
        },
        {
          label: 'First Year Withdrawal',
          value: values.monthlyWithdrawal * 12,
          type: 'currency',
          tooltip: 'Total withdrawals in the first year'
        },
        {
          label: 'Last Year Withdrawal',
          value: result.yearlyWithdrawalLastYear,
          type: 'currency',
          tooltip: 'Total withdrawals in the final year (adjusted for increase)'
        }
      ];

      if (result.remainingCorpus > 0) {
        calculatorResults.push({
          label: 'Remaining Corpus',
          value: result.remainingCorpus,
          type: 'currency',
          tooltip: 'Amount remaining after maximum calculation period (50 years)'
        });
      }

      return calculatorResults;
    } catch (err) {
      console.error('SWP calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Systematic Withdrawal Plan (SWP) Calculator"
        description="Calculate how long your investments will last with regular withdrawals. Plan your post-retirement withdrawals effectively."
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
