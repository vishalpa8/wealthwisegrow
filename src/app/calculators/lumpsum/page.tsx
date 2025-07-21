"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateLumpsum, LumpsumInputs } from '@/lib/calculations/savings';
import { lumpsumSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 100000,
  annualReturn: 12,
  years: 10
};

export default function LumpsumCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Investment Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
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

  const results = useMemo(() => {
    try {
      setError('');
      const validation = lumpsumSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      const calculation = calculateLumpsum(validation.data as LumpsumInputs);
      
      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Maturity Amount',
          value: calculation.maturityAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Total amount you will receive at maturity'
        },
        {
          label: 'Investment Amount',
          value: calculation.principal,
          type: 'currency',
          tooltip: 'Your initial investment'
        },
        {
          label: 'Total Returns',
          value: calculation.totalGains,
          type: 'currency',
          tooltip: 'Profit earned from your investment'
        },
        {
          label: 'Return Multiple',
          value: calculation.maturityAmount / calculation.principal,
          type: 'number',
          tooltip: 'How many times your money will grow'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const parsedValue = (name === 'principal' || name === 'annualReturn' || name === 'years') ? parseFloat(value) : value;
    setValues(prev => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Lumpsum Investment Calculator"
        description="Calculate the future value of your one-time investment with compound interest."
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
