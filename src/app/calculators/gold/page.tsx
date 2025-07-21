"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateGoldInvestment, GoldInputs } from '@/lib/calculations/savings';
import { goldSchema } from '@/lib/validations/calculator';

const initialValues = {
  investmentAmount: 100000,
  goldPricePerGram: 6000,
  years: 10,
  expectedAnnualReturn: 8
};

export default function GoldCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Investment Amount',
      name: 'investmentAmount',
      type: 'number',
      placeholder: '1,00,000',
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

  const results = useMemo(() => {
    try {
      setError('');
      const validation = goldSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      const calculation = calculateGoldInvestment(validation.data as GoldInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Future Value',
          value: calculation.futureValue,
          type: 'currency',
          highlight: true,
          tooltip: 'Expected value of your gold investment at maturity'
        },
        {
          label: 'Gold Quantity',
          value: calculation.gramsOfGold.toFixed(2),
          type: 'number',
          tooltip: 'Grams of gold you can buy with your investment'
        },
        {
          label: 'Future Gold Price',
          value: calculation.futureGoldPrice,
          type: 'currency',
          tooltip: 'Expected gold price per gram at maturity'
        },
        {
          label: 'Total Returns',
          value: calculation.totalReturns,
          type: 'currency',
          tooltip: 'Profit from your gold investment'
        },
        {
          label: 'Annualized Return',
          value: calculation.annualizedReturn,
          type: 'percentage',
          tooltip: 'Effective annual return rate'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const parsedValue = (name === 'investmentAmount' || name === 'goldPricePerGram' || name === 'expectedAnnualReturn' || name === 'years') ? parseFloat(value) : value;
    setValues(prev => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Gold Investment Calculator"
        description="Calculate the future value and returns from your gold investments."
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
