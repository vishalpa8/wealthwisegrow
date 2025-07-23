"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateRD, RDInputs } from '@/lib/calculations/savings';


const initialValues = {
  monthlyDeposit: 5000,
  annualRate: 6.5,
  years: 5
};

export default function RDCalculatorPage() {
  const [values, setValues] = useState<RDInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const rdResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases
      const calculation = calculateRD(values);

      return calculation;
    } catch (err: any) {
      console.error('RD calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Monthly Deposit',
      name: 'monthlyDeposit',
      type: 'number',
      placeholder: '5,000',
      unit: currency.symbol,
      tooltip: 'Amount you plan to deposit every month'
    },
    {
      label: 'Annual Interest Rate',
      name: 'annualRate',
      type: 'percentage',
      placeholder: '6.5',
      step: 0.1,
      tooltip: 'Annual interest rate offered by the bank'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '5',
      unit: 'years',
      tooltip: 'Number of years you want to continue the RD'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!rdResults) return [];

    return [
      {
        label: 'Maturity Amount',
        value: rdResults.maturityAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Total amount you will receive at maturity'
      },
      {
        label: 'Total Deposits',
        value: rdResults.totalDeposits,
        type: 'currency',
        tooltip: 'Total amount you will deposit over the period'
      },
      {
        label: 'Interest Earned',
        value: rdResults.totalInterest,
        type: 'currency',
        tooltip: 'Interest earned on your deposits'
      },
      {
        label: 'Effective Annual Return',
        value: ((rdResults.maturityAmount / rdResults.totalDeposits) ** (1 / values.years) - 1) * 100,
        type: 'percentage',
        tooltip: 'Annualized return rate considering compounding'
      }
    ];
  }, [rdResults, values.years, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Recurring Deposit Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">R.D.s are a good option for regular, disciplined savings.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Interest rates are usually fixed for the entire tenure.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider laddering R.D.s for liquidity.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Recurring Deposit Calculator"
      description="Calculate the maturity amount and interest earned on your Recurring Deposit investments."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Recurring Deposit Details"
        description="Enter your Recurring Deposit details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={rdResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}