'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";

const initialValues = {
  totalCorpus: 1000000,
  monthlyWithdrawal: 10000,
  expectedReturn: 8,
  withdrawalIncrease: 5
};

interface SWPInputs {
  totalCorpus: number;
  monthlyWithdrawal: number;
  expectedReturn: number;
  withdrawalIncrease: number;
}

function calculateSWP(inputs: SWPInputs) {
  const {
    totalCorpus,
    monthlyWithdrawal,
    expectedReturn,
    withdrawalIncrease
  } = inputs;

  const monthlyRate = expectedReturn / 12 / 100;
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
  const [values, setValues] = useState<SWPInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const swpResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases
      const calculation = calculateSWP(values);

      return calculation;
    } catch (err: any) {
      console.error('SWP calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Total Investment Corpus',
      name: 'totalCorpus',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
      tooltip: 'Your total investment amount from which you plan to withdraw'
    },
    {
      label: 'Monthly Withdrawal Amount',
      name: 'monthlyWithdrawal',
      type: 'number',
      placeholder: '10,000',
      unit: currency.symbol,
      tooltip: 'Amount you wish to withdraw each month'
    },
    {
      label: 'Expected Return Rate',
      name: 'expectedReturn',
      type: 'percentage',
      placeholder: '8',
      step: 0.1,
      tooltip: 'Expected annual return on your remaining investment'
    },
    {
      label: 'Annual Withdrawal Increase',
      name: 'withdrawalIncrease',
      type: 'percentage',
      placeholder: '5',
      step: 0.1,
      tooltip: 'Yearly increase in withdrawal amount to combat inflation'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!swpResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Corpus Will Last For',
        value: `${swpResults.years} years${swpResults.remainingMonths ? ` and ${swpResults.remainingMonths} months` : ''}`,
        type: 'number',
        highlight: true,
        tooltip: 'Expected duration your corpus will last'
      },
      {
        label: 'Initial Withdrawal Rate',
        value: (values.monthlyWithdrawal * 12 / values.totalCorpus) * 100,
        type: 'percentage',
        tooltip: 'Percentage of corpus withdrawn in first year'
      },
      {
        label: 'Total Amount Withdrawn',
        value: swpResults.totalWithdrawn,
        type: 'currency',
        tooltip: 'Total amount you will withdraw over the period'
      },
      {
        label: 'First Year Withdrawal',
        value: swpResults.yearlyWithdrawalFirstYear,
        type: 'currency',
        tooltip: 'Total withdrawals in the first year'
      },
      {
        label: 'Last Year Withdrawal',
        value: swpResults.yearlyWithdrawalLastYear,
        type: 'currency',
        tooltip: 'Total withdrawals in the final year (adjusted for increase)'
      }
    ];

    if (swpResults.remainingCorpus > 0) {
      calculatorResults.push({
        label: 'Remaining Corpus',
        value: swpResults.remainingCorpus,
        type: 'currency',
        tooltip: 'Amount remaining after maximum calculation period (50 years)'
      });
    }

    return calculatorResults;
  }, [swpResults, values.monthlyWithdrawal, values.totalCorpus, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">SWP Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">SWP helps create a regular income stream from investments.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Adjust withdrawal amounts to account for inflation.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Monitor your corpus regularly to ensure sustainability.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Systematic Withdrawal Plan (SWP) Calculator"
      description="Calculate how long your investments will last with regular withdrawals. Plan your post-retirement withdrawals effectively."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="SWP Details"
        description="Enter your SWP details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={swpResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}