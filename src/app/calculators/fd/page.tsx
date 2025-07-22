"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateFD, FDInputs } from '@/lib/calculations/savings';
import { fdSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 100000,
  annualRate: 6.5,
  years: 2,
  compoundingFrequency: 'quarterly' as const,
};

export default function FDCalculatorPage() {
  const [values, setValues] = useState<FDInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const fdResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      const validation = fdSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

      const calculation = calculateFD(values);

      return calculation;
    } catch (err: any) {
      console.error('FD calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Investment Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      min: 1000,
      max: 50000000,
      required: true,
      tooltip: 'Amount you want to invest in Fixed Deposit'
    },
    {
      label: 'Annual Interest Rate',
      name: 'annualRate',
      type: 'percentage',
      placeholder: '6.5',
      min: 1,
      max: 20,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate offered by the bank'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '2',
      min: 0.25,
      max: 20,
      step: 0.25,
      unit: 'years',
      required: true,
      tooltip: 'Duration for which you want to keep the FD'
    },
    {
      label: 'Compounding Frequency',
      name: 'compoundingFrequency',
      type: 'select',
      required: true,
      options: [
        { value: 'yearly', label: 'Yearly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' }
      ],
      tooltip: 'How often the interest is compounded'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!fdResults) return [];

    return [
      {
        label: 'Maturity Amount',
        value: fdResults.maturityAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Amount you will receive at maturity'
      },
      {
        label: 'Principal Amount',
        value: fdResults.principal,
        type: 'currency',
        tooltip: 'Your initial investment'
      },
      {
        label: 'Interest Earned',
        value: fdResults.totalInterest,
        type: 'currency',
        tooltip: 'Interest earned on your investment'
      },
      {
        label: 'Effective Yield',
        value: fdResults.effectiveYield,
        type: 'percentage',
        tooltip: 'Effective annual yield considering compounding'
      }
    ];
  }, [fdResults, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Fixed Deposit Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">FDs offer guaranteed returns and capital safety.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Choose compounding frequency based on your needs.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider tax implications on FD interest.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Fixed Deposit Calculator"
      description="Calculate the maturity amount and interest earned on your Fixed Deposit investments."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Fixed Deposit Details"
        description="Enter your Fixed Deposit details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={fdResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}