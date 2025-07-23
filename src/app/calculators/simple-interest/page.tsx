"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import {
  parseRobustNumber,
  safeDivide,
  safeMultiply,
  safeAdd,
  roundToPrecision
} from '@/lib/utils/number';

const initialValues = {
  principal: 100000,
  rate: 8,
  time: 3
};

interface SimpleInterestInputs {
  principal: number;
  rate: number;
  time: number;
}

function calculateSimpleInterest(inputs: SimpleInterestInputs) {
  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const time = parseRobustNumber(inputs.time);

  // Simple Interest formula: SI = P * R * T / 100
  const simpleInterest = safeDivide(
    safeMultiply(safeMultiply(principal, rate), time),
    100
  );

  const totalAmount = safeAdd(principal, simpleInterest);

  return {
    principal: roundToPrecision(principal),
    simpleInterest: roundToPrecision(simpleInterest),
    totalAmount: roundToPrecision(totalAmount),
    effectiveRate: roundToPrecision(safeDivide(safeMultiply(simpleInterest, 100), principal)),
    monthlyInterest: roundToPrecision(safeDivide(simpleInterest, safeMultiply(time, 12)))
  };
}

export default function SimpleInterestCalculatorPage() {
  const [values, setValues] = useState<SimpleInterestInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const simpleInterestResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases
      const calculation = calculateSimpleInterest(values);

      return calculation;
    } catch (err: any) {
      console.error('Simple interest calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Principal Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      tooltip: 'The initial amount of money'
    },
    {
      label: 'Annual Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8',
      step: 0.1,
      tooltip: 'Annual interest rate (simple interest rate)'
    },
    {
      label: 'Time Period',
      name: 'time',
      type: 'number',
      placeholder: '3',
      step: 0.1,
      unit: 'years',
      tooltip: 'Duration for which money is invested or borrowed'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!simpleInterestResults) return [];

    return [
      {
        label: 'Total Amount',
        value: simpleInterestResults.totalAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Principal + Simple Interest'
      },
      {
        label: 'Principal Amount',
        value: simpleInterestResults.principal,
        type: 'currency',
        tooltip: 'Initial investment amount'
      },
      {
        label: 'Simple Interest',
        value: simpleInterestResults.simpleInterest,
        type: 'currency',
        tooltip: 'Interest earned using simple interest formula'
      },
      {
        label: 'Effective Return Rate',
        value: simpleInterestResults.effectiveRate,
        type: 'percentage',
        tooltip: 'Total return as percentage of principal'
      },
      {
        label: 'Monthly Interest',
        value: simpleInterestResults.monthlyInterest,
        type: 'currency',
        tooltip: 'Average interest earned per month'
      }
    ];
  }, [simpleInterestResults, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 400);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Simple Interest Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Simple interest is calculated only on the principal amount.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Often used for short-term loans or basic investments.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare with compound interest for long-term gains.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Simple Interest Calculator"
      description="Calculate simple interest earned on investments or loans using the formula: SI = P × R × T ÷ 100"
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Simple Interest Details"
        description="Enter the principal, rate, and time to calculate simple interest."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={simpleInterestResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}