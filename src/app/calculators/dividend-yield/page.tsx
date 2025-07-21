"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateDividendYield, DividendYieldInputs } from '@/lib/calculations/savings';
import { dividendYieldSchema } from '@/lib/validations/calculator';

const initialValues = {
  stockPrice: 1000,
  annualDividend: 50,
  numberOfShares: 100
};

export default function DividendYieldCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Stock Price',
      name: 'stockPrice',
      type: 'number',
      placeholder: '1,000',
      min: 1,
      max: 100000,
      required: true,
      tooltip: 'Current price per share of the stock'
    },
    {
      label: 'Annual Dividend per Share',
      name: 'annualDividend',
      type: 'number',
      placeholder: '50',
      min: 0,
      max: 10000,
      required: true,
      tooltip: 'Dividend paid per share annually'
    },
    {
      label: 'Number of Shares',
      name: 'numberOfShares',
      type: 'number',
      placeholder: '100',
      min: 1,
      max: 1000000,
      required: true,
      tooltip: 'Number of shares you own or plan to buy'
    }
  ];

  const results = useMemo(() => {
    const parsedValues = {
      stockPrice: parseFloat(values.stockPrice as any),
      annualDividend: parseFloat(values.annualDividend as any),
      numberOfShares: parseInt(values.numberOfShares as any, 10),
    };

    const validation = dividendYieldSchema.safeParse(parsedValues);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message;
      if (firstError) {
        setError(firstError);
      }
      return [];
    }
    // console.log(validation.data);

    try {
      setError('');
      const calculation = calculateDividendYield(validation.data as DividendYieldInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Dividend Yield',
          value: calculation.dividendYield,
          type: 'percentage',
          highlight: true,
          tooltip: 'Annual dividend yield as percentage of stock price'
        },
        {
          label: 'Total Investment',
          value: calculation.totalInvestment,
          type: 'currency',
          tooltip: 'Total amount invested in the stock'
        },
        {
          label: 'Annual Dividend Income',
          value: calculation.annualDividendIncome,
          type: 'currency',
          tooltip: 'Total annual dividend income from all shares'
        },
        {
          label: 'Quarterly Dividend Income',
          value: calculation.quarterlyDividendIncome,
          type: 'currency',
          tooltip: 'Quarterly dividend income'
        },
        {
          label: 'Monthly Dividend Income',
          value: calculation.monthlyDividendIncome,
          type: 'currency',
          tooltip: 'Average monthly dividend income'
        }
      ];

      return calculatorResults;
    } catch {
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
        title="Dividend Yield Calculator"
        description="Calculate dividend yield and income from your stock investments."
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
