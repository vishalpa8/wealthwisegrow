"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateDividendYield, DividendYieldInputs } from '@/lib/calculations/savings';


const initialValues = {
  stockPrice: 1000,
  annualDividend: 50,
  numberOfShares: 100
};

export default function DividendYieldCalculatorPage() {
  const [values, setValues] = useState<DividendYieldInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const dividendYieldResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases
      return calculateDividendYield(values);
    } catch (err: any) {
      console.error('Dividend yield calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Stock Price',
      name: 'stockPrice',
      type: 'number',
      placeholder: '1,000',
      unit: currency.symbol,
      tooltip: 'Current price per share of the stock'
    },
    {
      label: 'Annual Dividend per Share',
      name: 'annualDividend',
      type: 'number',
      placeholder: '50',
      unit: currency.symbol,
      tooltip: 'Dividend paid per share annually'
    },
    {
      label: 'Number of Shares',
      name: 'numberOfShares',
      type: 'number',
      placeholder: '100',
      tooltip: 'Number of shares you own or plan to buy'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!dividendYieldResults) return [];

    return [
      {
        label: 'Dividend Yield',
        value: dividendYieldResults.dividendYield,
        type: 'percentage',
        highlight: true,
        tooltip: 'Annual dividend yield as percentage of stock price'
      },
      {
        label: 'Total Investment',
        value: dividendYieldResults.totalInvestment,
        type: 'currency',
        tooltip: 'Total amount invested in the stock'
      },
      {
        label: 'Annual Dividend Income',
        value: dividendYieldResults.annualDividendIncome,
        type: 'currency',
        tooltip: 'Total annual dividend income from all shares'
      },
      {
        label: 'Quarterly Dividend Income',
        value: dividendYieldResults.quarterlyDividendIncome,
        type: 'currency',
        tooltip: 'Quarterly dividend income'
      },
      {
        label: 'Monthly Dividend Income',
        value: dividendYieldResults.monthlyDividendIncome,
        type: 'currency',
        tooltip: 'Average monthly dividend income'
      }
    ];
  }, [dividendYieldResults, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Dividend Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Focus on companies with consistent dividend history.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">High dividend yield doesn't always mean a good investment.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Reinvest dividends to accelerate wealth accumulation.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Dividend Yield Calculator"
      description="Calculate dividend yield and income from your stock investments."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Dividend Details"
        description="Enter your stock and dividend information."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={dividendYieldResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}