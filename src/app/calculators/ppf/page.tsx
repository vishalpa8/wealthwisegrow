"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculatePPF, PPFInputs } from '@/lib/calculations/savings';


const initialValues = {
  yearlyInvestment: 150000,
  years: 15
};

export default function PPFCalculatorPage() {
  const [values, setValues] = useState<PPFInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const ppfResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases
      const calculation = calculatePPF(values);

      return calculation;
    } catch (err: any) {
      console.error('PPF calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Yearly Investment',
      name: 'yearlyInvestment',
      type: 'number',
      placeholder: '1,50,000',
      unit: currency.symbol,
      tooltip: 'Amount you plan to invest annually in PPF'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '15',
      unit: 'years',
      tooltip: 'Duration for PPF investment'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!ppfResults) return [];

    return [
      {
        label: 'Maturity Amount',
        value: ppfResults.maturityAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Total amount you will receive at maturity'
      },
      {
        label: 'Total Investment',
        value: ppfResults.totalInvestment,
        type: 'currency',
        tooltip: 'Total amount you will invest over the period'
      },
      {
        label: 'Total Returns',
        value: ppfResults.totalGains,
        type: 'currency',
        tooltip: 'Interest earned on your PPF investment'
      },
      {
        label: 'Effective Annual Return',
        value: ((ppfResults.maturityAmount / ppfResults.totalInvestment) ** (1 / values.years) - 1) * 100,
        type: 'percentage',
        tooltip: 'Annualized return rate considering compounding'
      }
    ];
  }, [ppfResults, values.years, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">PPF Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">PPF offers tax-free returns and EEE status.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Long lock-in period makes it suitable for long-term goals.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">You can make partial withdrawals after 7 years.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="PPF Calculator"
      description="Calculate the maturity amount and returns on your Public Provident Fund (PPF) investment with tax benefits."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="PPF Details"
        description="Enter your PPF investment details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={ppfResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
