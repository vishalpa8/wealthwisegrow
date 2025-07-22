"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLumpsum, LumpsumInputs } from '@/lib/calculations/savings';
import { lumpsumSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 100000,
  annualReturn: 12,
  years: 10
};

export default function LumpsumCalculatorPage() {
  const [values, setValues] = useState<LumpsumInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const lumpsumResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      const validation = lumpsumSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

      const calculation = calculateLumpsum(values);
      
      return calculation;
    } catch (err: any) {
      console.error('Lumpsum calculation error:', err);
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
      max: 100000000,
      required: true,
      tooltip: 'One-time investment amount'
    },
    {
      label: 'Expected Annual Return',
      name: 'annualReturn',
      type: 'percentage',
      placeholder: '12',
      min: 1,
      max: 50,
      required: true,
      tooltip: 'Expected annual return rate from your investment'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      min: 1,
      max: 50,
      unit: 'years',
      required: true,
      tooltip: 'Number of years to keep the investment'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!lumpsumResults) return [];

    return [
      {
        label: 'Maturity Amount',
        value: lumpsumResults.maturityAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Total amount you will receive at maturity'
      },
      {
        label: 'Investment Amount',
        value: lumpsumResults.principal,
        type: 'currency',
        tooltip: 'Your initial investment'
      },
      {
        label: 'Total Returns',
        value: lumpsumResults.totalGains,
        type: 'currency',
        tooltip: 'Profit earned from your investment'
      },
      {
        label: 'Return Multiple',
        value: lumpsumResults.maturityAmount / lumpsumResults.principal,
        type: 'number',
        tooltip: 'How many times your money will grow'
      }
    ];
  }, [lumpsumResults, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Lumpsum Investment Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Lumpsum investments are ideal for one-time large sums.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider market conditions before making a lumpsum investment.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Longer investment horizons generally yield better returns.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Lumpsum Investment Calculator"
      description="Calculate the future value of your one-time investment with compound interest."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Lumpsum Investment Details"
        description="Enter your lumpsum investment details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={lumpsumResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}