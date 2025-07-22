"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateGoldInvestment, GoldInputs } from '@/lib/calculations/savings';
import { goldSchema } from '@/lib/validations/calculator';

const initialValues = {
  investmentAmount: 100000,
  goldPricePerGram: 6000,
  years: 10,
  expectedAnnualReturn: 8
};

export default function GoldCalculatorPage() {
  const [values, setValues] = useState<GoldInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const goldResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      const validation = goldSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

      const calculation = calculateGoldInvestment(values);

      return calculation;
    } catch (err: any) {
      console.error('Gold calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Investment Amount',
      name: 'investmentAmount',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      min: 1000,
      max: 10000000,
      required: true,
      tooltip: 'Amount you want to invest in gold'
    },
    {
      label: 'Current Gold Price per Gram',
      name: 'goldPricePerGram',
      type: 'number',
      placeholder: '6,000',
      unit: currency.symbol,
      min: 1000,
      max: 50000,
      required: true,
      tooltip: 'Current price of gold per gram'
    },
    {
      label: 'Expected Annual Return',
      name: 'expectedAnnualReturn',
      type: 'percentage',
      placeholder: '8',
      min: -20,
      max: 30,
      required: true,
      tooltip: 'Expected annual appreciation in gold prices'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      min: 1,
      max: 30,
      unit: 'years',
      required: true,
      tooltip: 'Number of years you plan to hold the gold'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!goldResults) return [];

    return [
      {
        label: 'Future Value',
        value: goldResults.futureValue,
        type: 'currency',
        highlight: true,
        tooltip: 'Expected value of your gold investment at maturity'
      },
      {
        label: 'Gold Quantity',
        value: goldResults.gramsOfGold.toFixed(2),
        type: 'number',
        tooltip: 'Grams of gold you can buy with your investment'
      },
      {
        label: 'Future Gold Price',
        value: goldResults.futureGoldPrice,
        type: 'currency',
        tooltip: 'Expected gold price per gram at maturity'
      },
      {
        label: 'Total Returns',
        value: goldResults.totalReturns,
        type: 'currency',
        tooltip: 'Profit from your gold investment'
      },
      {
        label: 'Annualized Return',
        value: goldResults.annualizedReturn,
        type: 'percentage',
        tooltip: 'Effective annual return rate'
      }
    ];
  }, [goldResults, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Gold Investment Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Gold is often considered a safe-haven asset.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Diversify your portfolio with a small allocation to gold.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider digital gold or gold ETFs for convenience.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Gold Investment Calculator"
      description="Calculate the future value and returns from your gold investments."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Gold Investment Details"
        description="Enter your gold investment details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={goldResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}